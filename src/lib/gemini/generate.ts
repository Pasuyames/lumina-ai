import "server-only";
import { getGemini } from "@/lib/gemini/client";
import { serverEnv } from "@/lib/env";
import { withTimeout } from "@/lib/security/timeout";
import type { ProductImage } from "@/lib/gemini/prompt-kit";
import { MULTI_ANGLE_INSTRUCTION } from "@/lib/gemini/prompt-kit";

/** 2K render uzun sürebilir; yine de sonsuz bekleme yok. */
const GENERATE_TIMEOUT_MS = 150_000;

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

/**
 * Görsel üretim modeline gidecek değişmez talimat — orijinali koru. İnce
 * tekrarlayan desenlerde (zincir halkası, örgü, taş dizilimi) modelin "benzer
 * ama farklı" bir motif icat etme eğilimine karşı özellikle sertleştirildi —
 * bkz. kullanıcı bulgusu: aynı bilezik iki farklı karede farklı zincir
 * deseniyle render edilmişti.
 */
const PRESERVE_INSTRUCTION =
  "CRITICAL — PRODUCT FIDELITY: This is the exact physical object shown in the " +
  "reference image, not a similar or inspired product. Treat this as a " +
  "compositing task — placing the real object into a new scene — never as a " +
  "redesign. Preserve its exact shape, structure, proportions, material, color " +
  "and texture with zero distortion. Pay special attention to fine repeating " +
  "geometric details — chain link count and link shape, weave/stitch pattern, " +
  "clasp/hardware design, engravings, gemstone cut and count, seams — and " +
  "reproduce them EXACTLY as shown in the reference image. This also applies to " +
  "any logo, emblem, monogram or brand mark on the product — reproduce it at " +
  "the EXACT same position, size and orientation on the product as in the " +
  "reference image; do not move, resize, re-center or relocate it to a " +
  "different part of the product, even when cropping in closer for a detail " +
  "shot. Do not reinterpret, simplify, regenerate, or invent a different but " +
  "similar-looking pattern. Do not redesign or alter the product itself in any " +
  "way. Only replace the background, surface, lighting, shadows and " +
  "reflections according to the scene below. Keep the product perfectly sharp " +
  "and in focus as the hero of a premium e-commerce photograph.";

/**
 * Her render'a kod tarafında zorlanan premium kalite çıpası — Renza'nın imza
 * görünümü. Sahne İÇERİĞİNİ değiştirmez; ışık/renk/doku işleme kalitesini
 * yukarı çeker (REALISM_ANCHOR ile aynı desen: prompta güvenme, kodla zorla).
 * ÖNEMLİ: eskiden "deep controlled shadows" gibi sabit bir ışık yönü
 * dayatıyordu — bu, sahne ne olursa olsun karanlık/dramatik mermer estetiğine
 * yakınsamaya yol açtı (kullanıcı geri bildirimi: "bu tarz mermer kompozisyonu
 * pek hoşa gitmedi"). Artık ışık yönünü SAHNEYE bırakıyor, sadece gerçekçilik
 * ve kalite tabanını zorluyor.
 */
const LUXURY_ANCHOR =
  "Style: premium commercial product photography, impeccable styling, refined " +
  "color grading, rich tactile material rendering, the polished look of a " +
  "flagship brand campaign — executed with full photographic realism, as if " +
  "captured with a real camera, not an illustration or render. Follow the " +
  "lighting mood described in the scene faithfully, whether bright and airy or " +
  "moody and dramatic — do not force shadows, darkness or drama the scene " +
  "doesn't call for. Nothing in the frame may look cheap, cluttered, " +
  "artificial or amateur.";

/**
 * Yaygın AI-görsel hatalarını yasaklayan evrensel negatif çapa — her render'a
 * (concept/template/custom/creative/sales-set, tüm yollar generateProductImage'a
 * aktığı için) kod tarafından zorlanır. Prompt yazıcılarına güvenmek yerine
 * (LUXURY_ANCHOR/PRESERVE_INSTRUCTION ile aynı "kodla zorla" deseni) tek
 * geçiş noktasında %100 kapsama sağlar.
 */
const NEGATIVE_ANCHOR =
  "CRITICAL — NO VISIBLE EQUIPMENT: The final image must NEVER show any " +
  "physical lighting or photography equipment as a visible object in the " +
  "frame — a softbox, light panel, diffuser panel, umbrella, reflector, " +
  "light stand, tripod, cable, backdrop clamp, or C-stand must not appear " +
  "anywhere in the shot, including at the very top or edges of the frame, " +
  "in reflections, or blurred in the background. A common failure mode is " +
  "rendering a bright rectangular panel with a visible dark frame (a " +
  "softbox) hovering above or behind the product — this must NEVER happen, " +
  "under any circumstances. The lighting must read as if it is shining ON " +
  "the subject from completely off-camera, invisible sources — never as if " +
  "the light fixture itself is a visible object in the composition. This " +
  "must look like a fully finished, retouched final photograph, not a " +
  "behind-the-scenes shot of a photo studio.\n\n" +
  "CRITICAL — NO EXAGGERATED SPARKLE/GLARE: On metallic, glass, or other " +
  "reflective surfaces, render ONLY soft, realistic specular highlights " +
  "that match the size, shape, and softness of the actual light source — " +
  "never sharp, star-shaped, or lens-flare-style sparkle bursts, isolated " +
  "glinting dots, or streaks of light that look like a rendering artifact " +
  "rather than a photographed reflection. A common failure mode is adding " +
  "small bright star/sparkle glints on metal edges, hinges, or trim (as if " +
  "from a camera lens flare) — this must NEVER happen. Highlights should " +
  "look like a continuous, soft gradient of brightness across the " +
  "reflective surface, exactly as a real photograph would show, not a " +
  "decorative sparkle effect.\n\n" +
  "Also avoid: extra or malformed limbs/fingers, distorted or illegible " +
  "logos and text, watermarks or overlaid text, oversaturated colors or " +
  "blown-out highlights, duplicated or cloned product instances, floating " +
  "or physically inconsistent shadows, visible rendering seams or blending " +
  "artifacts, warped or melted geometry, an artificial CGI or plastic " +
  "AI-render look, overly smooth or waxy material rendering that looks " +
  "synthetic rather than photographed.";

/**
 * Evrensel hiper-gerçekçilik çapası — eskiden sadece sales-set.ts'in kendi
 * REALISM_ANCHOR'ı vardı ve SADECE Satış Seti akışında kullanılıyordu; buraya
 * taşınıp genişletildi ki her render (concept/template/custom/creative/
 * sales-set) aynı gerçekçilik tabanını alsın. Kullanıcı talebi: "kusursuz
 * değil, ultra gerçekçi" — aşırı temiz/simetrik "AI görünümü" yerine gerçek
 * kamera/doku hissi.
 */
const HYPER_REALISM_ANCHOR =
  "Photographic authenticity: this must read as an authentic photograph shot " +
  "on a real full-frame camera with an 85-100mm lens at roughly f/4-f/5.6 — " +
  "natural optical characteristics, correct perspective compression, and " +
  "realistic bokeh falloff for this focal length and aperture, not a flat or " +
  "artificially uniform rendering. Lighting should feel natural and slightly " +
  "imperfect rather than flawless studio-perfect uniformity; true-to-life " +
  "material and skin texture, subtle film grain, and realistic depth of " +
  "field. Avoid an overly perfect, airbrushed, or symmetrical look — real " +
  "photographed subjects have natural, believable micro-imperfections (faint " +
  "asymmetry, subtle surface variation, natural texture irregularities) that " +
  "AI renders tend to erase; preserve or introduce this authenticity rather " +
  "than smoothing it away. This is not about flaws for their own sake — the " +
  "product itself must still be pristine and sharp — it is about the " +
  "PHOTOGRAPH looking real rather than synthetic.";

/**
 * AŞAMA 2 — Nano Banana 2 (gemini-3-pro-image-preview) ile 2K render.
 * Maliyet: GÖRSEL ÜRETİMİ — pahalı. Çağıran taraf krediyi yönetmeli.
 */
export async function generateProductImage(
  images: ProductImage[],
  scenePrompt: string,
  aspectRatio = "4:5",
  imageSize: "2K" | "4K" = "2K",
): Promise<GeneratedImage> {
  const ai = getGemini();

  const multiAngleNote = images.length > 1 ? `\n\n${MULTI_ANGLE_INSTRUCTION}` : "";

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
                text: `${PRESERVE_INSTRUCTION}\n\nScene: ${scenePrompt}\n\n${LUXURY_ANCHOR}\n\n${NEGATIVE_ANCHOR}\n\n${HYPER_REALISM_ANCHOR}${multiAngleNote}`,
              },
              ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } })),
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
