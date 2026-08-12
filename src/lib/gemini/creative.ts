import "server-only";
import { Type } from "@google/genai";
import { getGemini } from "@/lib/gemini/client";
import { serverEnv } from "@/lib/env";
import { withTimeout } from "@/lib/security/timeout";
import {
  FORBIDDEN_CHEAP_SURFACES,
  PRESERVE_PRODUCT_INTEGRITY,
  CALIBRATION_EXAMPLES,
  SECTOR_EXPERTISE_INSTRUCTION,
  MULTI_ANGLE_INSTRUCTION,
  type ProductImage,
} from "@/lib/gemini/prompt-kit";

/** Vision analizi için üst sınır — askıda kalan istek kullanıcıyı kilitlemesin. */
const ANALYZE_TIMEOUT_MS = 60_000;

export interface CreativeConcept {
  /** Kullanıcıya gösterilen başlık (Türkçe). */
  title: string;
  /** Görsel üretim modeline gidecek prompt (İngilizce). */
  prompt: string;
}

const SYSTEM_PROMPT = `Sen ödüllü bir reklam ajansının baş yaratıcı yönetmenisin. Sana verilen
ürün fotoğrafı için TEK ve CÜRETKAR bir kampanya sahnesi tasarla — kullanıcı kreatif bir
sonuç istiyor, güvenli/beklenen bir sahne istemiyor.

Kurallar:
- Standart e-ticaret kalıplarından (düz beyaz fon, sıradan masa üstü) UZAK DUR. Bunun yerine
  beklenmedik bir ortam, cesur bir renk paleti, sürreal ama zevkli bir kompozisyon, çarpıcı bir
  ışık oyunu ya da alışılmadık bir kamera açısı kullan. Amaç: "bunu hiç böyle görmemiştim" hissi.
- Yine de bu bir ÜRÜN FOTOĞRAFI kalır — sahne ürünü gölgede bırakmaz, ona hizmet eder.
- ${PRESERVE_PRODUCT_INTEGRITY} Arka plan, ışık, zemin, yansıma ve atmosfer tamamen
  serbest — cüretkar sahnenin ruhu budur.
- ${FORBIDDEN_CHEAP_SURFACES}
- Cüretkarlık asla ucuzluk demek değil — her zaman yüksek bütçeli bir kampanya çekimi gibi
  hissettirmeli.
- "observations" alanına önce ürünü incele: materyalini, rengini, yüzey özelliğini
  (parlak/mat/şeffaf/dokulu) ve oranlarını kısaca not et; "prompt" alanını bu nota göre yaz.
- "title" TÜRKÇE, kısa ve çarpıcı (kullanıcıya gösterilecek, ör. "Mor Dumanın İçinde").
- "prompt" İNGİLİZCE ve detaylı olmalı: zemin/materyal, ışık yönü ve sıcaklığı, gölge ve yansıma,
  atmosfer, kompozisyon ve kamera açısı içermeli.

${CALIBRATION_EXAMPLES}

${SECTOR_EXPERTISE_INSTRUCTION}`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    observations: { type: Type.STRING },
    title: { type: Type.STRING },
    prompt: { type: Type.STRING },
  },
  required: ["observations", "title", "prompt"],
  propertyOrdering: ["observations", "title", "prompt"],
};

/**
 * Kreatif Üret (tek tık) — Gemini Vision ile ürüne özel, cüretkar TEK
 * kampanya sahnesi üretir. Maliyet: sadece metin/vision (görsel üretim YOK),
 * kredi düşmez; çağıran taraf sonucu doğrudan render'a gönderir.
 */
export async function analyzeForCreative(
  images: ProductImage[],
  categoryHint?: string,
): Promise<CreativeConcept> {
  const ai = getGemini();

  const baseUserText = categoryHint
    ? `Kullanıcının belirttiği kategori ipucu: "${categoryHint}". Bu ürün için tek bir cüretkar kampanya sahnesi tasarla.`
    : `Bu ürün için tek bir cüretkar kampanya sahnesi tasarla.`;
  const userText =
    images.length > 1 ? `${baseUserText}\n\n${MULTI_ANGLE_INSTRUCTION}` : baseUserText;

  let response;
  try {
    response = await withTimeout(
      ai.models.generateContent({
        model: serverEnv.geminiVisionModel,
        contents: [
          {
            role: "user",
            parts: [
              { text: `${SYSTEM_PROMPT}\n\n${userText}` },
              ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } })),
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 1.1,
        },
      }),
      ANALYZE_TIMEOUT_MS,
      "Kreatif analiz",
    );
  } catch (e) {
    // SDK hatası iç detay içerebilir — logla, kullanıcıya genel mesaj dön.
    console.error("[gemini/creative] API hatası:", e);
    throw new Error(
      e instanceof Error && e.message.includes("zaman aşımı")
        ? e.message
        : "Yapay zekâ servisine şu an ulaşılamıyor, lütfen tekrar deneyin.",
    );
  }

  const raw = response.text;
  if (!raw) {
    throw new Error("Gemini Vision boş yanıt döndürdü.");
  }

  let parsed: CreativeConcept;
  try {
    parsed = JSON.parse(raw) as CreativeConcept;
  } catch {
    throw new Error("Gemini yanıtı JSON olarak ayrıştırılamadı.");
  }

  if (!parsed.title?.trim() || !parsed.prompt?.trim()) {
    throw new Error("Kreatif konsept üretilemedi, lütfen tekrar deneyin.");
  }

  return parsed;
}
