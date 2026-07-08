import "server-only";
import { getGemini } from "@/lib/gemini/client";
import { serverEnv } from "@/lib/env";
import { withTimeout } from "@/lib/security/timeout";

/** 2K render uzun sürebilir; yine de sonsuz bekleme yok. */
const GENERATE_TIMEOUT_MS = 150_000;

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

/** Görsel üretim modeline gidecek değişmez talimat — orijinali koru. */
const PRESERVE_INSTRUCTION =
  "CRITICAL: Preserve the original product's exact shape, structure, proportions, " +
  "material, color and texture without any distortion. Do not redesign or alter the " +
  "product itself. Only replace the background, surface, lighting, shadows and " +
  "reflections according to the scene below. Keep the product perfectly sharp and " +
  "in focus as the hero of a premium e-commerce photograph.";

/**
 * Her render'a kod tarafında zorlanan lüks kampanya estetiği — Lumina'nın imza
 * görünümü. Sahne İÇERİĞİNİ değiştirmez; ışık/renk/doku işleme kalitesini
 * yukarı çeker (REALISM_ANCHOR ile aynı desen: prompta güvenme, kodla zorla).
 */
const LUXURY_ANCHOR =
  "Style: high-end luxury advertising campaign aesthetic — premium commercial " +
  "product photography, impeccable styling, refined cinematic color grading, " +
  "deep controlled shadows and elegant highlights, rich tactile material " +
  "rendering, the expensive polished look of a flagship brand campaign. " +
  "Nothing in the frame may look cheap, cluttered or amateur.";

/**
 * AŞAMA 2 — Nano Banana 2 (gemini-3-pro-image-preview) ile 2K render.
 * Maliyet: GÖRSEL ÜRETİMİ — pahalı. Çağıran taraf krediyi yönetmeli.
 */
export async function generateProductImage(
  imageBase64: string,
  mimeType: string,
  scenePrompt: string,
  aspectRatio = "4:5",
  imageSize: "2K" | "4K" = "2K",
): Promise<GeneratedImage> {
  const ai = getGemini();

  let response;
  try {
    response = await withTimeout(
      ai.models.generateContent({
        model: serverEnv.geminiImageModel,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${PRESERVE_INSTRUCTION}\n\nScene: ${scenePrompt}\n\n${LUXURY_ANCHOR}`,
              },
              { inlineData: { mimeType, data: imageBase64 } },
            ],
          },
        ],
        config: {
          imageConfig: {
            aspectRatio,
            imageSize,
          },
        },
      }),
      GENERATE_TIMEOUT_MS,
      "Görsel üretimi",
    );
  } catch (e) {
    // SDK hatası iç detay içerebilir — logla, kullanıcıya genel mesaj dön.
    console.error("[gemini/generate] API hatası:", e);
    throw new Error(
      e instanceof Error && e.message.includes("zaman aşımı")
        ? e.message
        : "Görsel üretim servisine şu an ulaşılamıyor, lütfen tekrar deneyin.",
    );
  }

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType ?? "image/png",
      };
    }
  }

  throw new Error("Görsel üretilemedi (modelden görsel dönmedi).");
}
