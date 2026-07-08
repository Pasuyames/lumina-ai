import "server-only";
import { Type } from "@google/genai";
import { getGemini } from "@/lib/gemini/client";
import { serverEnv } from "@/lib/env";
import { withTimeout } from "@/lib/security/timeout";

/** Vision analizi için üst sınır — askıda kalan istek kullanıcıyı kilitlemesin. */
const ANALYZE_TIMEOUT_MS = 60_000;

export interface Concept {
  /** Kullanıcıya gösterilen başlık (Türkçe). */
  title: string;
  /** Kısa açıklama (Türkçe). */
  description: string;
  /** Görsel üretim modeline gidecek prompt (İngilizce). */
  prompt: string;
}

export interface ProductAnalysis {
  category: string;
  material: string;
  segment: string;
  concepts: Concept[];
}

const SYSTEM_PROMPT = `Sen lüks e-ticaret markaları için çalışan deneyimli bir sanat yönetmenisin.
Sana verilen ürün fotoğrafını incele: kategorisini, materyalini ve pazar segmentini belirle.
Ardından bu ürünün satışını artıracak, birbirinden FARKLI en lüks 3 fotoğraf stüdyosu konsepti üret.

Kurallar:
- "title" ve "description" alanları TÜRKÇE olmalı (kullanıcıya gösterilecek).
- "prompt" alanı İNGİLİZCE ve detaylı olmalı (görsel üretim modeline gidecek): zemin/materyal,
  ışık yönü ve sıcaklığı, gölge ve yansıma, atmosfer, kompozisyon ve kamera açısı içermeli.
- Her prompt, ürünün ORİJİNAL şeklini, yapısını ve dokusunu KORUMASI gerektiğini vurgulamalı;
  yalnızca arka plan, ışık, zemin ve yansıma değişmeli.
- 3 konsept belirgin şekilde farklı olmalı (ör. mermer lüks, sıcak doğal, dramatik stüdyo).
- Ürün algısını UCUZLATAN sahnelerden kaçın: sıradan/rustik ahşap masa üstü, dağınık ev
  ortamı, mutfak tezgâhı, ucuz plastik yüzeyler YASAK. Zemin daima premium olmalı:
  mermer, doğal taş, kadife, saten, cam, lake veya fırçalanmış metal. Ahşap yalnızca
  lüks bağlamda kabul edilebilir (koyu ceviz, yüksek cila, butik vitrin sunumu).`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING },
    material: { type: Type.STRING },
    segment: { type: Type.STRING },
    concepts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          prompt: { type: Type.STRING },
        },
        required: ["title", "description", "prompt"],
        propertyOrdering: ["title", "description", "prompt"],
      },
    },
  },
  required: ["category", "material", "segment", "concepts"],
  propertyOrdering: ["category", "material", "segment", "concepts"],
};

/**
 * AŞAMA 1 — Gemini Vision ile ürün analizi + 3 konsept önerisi.
 * Maliyet: sadece metin/vision (görsel üretim YOK), kredi düşmez.
 */
export async function analyzeProduct(
  imageBase64: string,
  mimeType: string,
  categoryHint?: string,
): Promise<ProductAnalysis> {
  const ai = getGemini();

  const userText = categoryHint
    ? `Kullanıcının belirttiği kategori ipucu: "${categoryHint}". Bu ürünü analiz et ve 3 lüks konsept öner.`
    : `Bu ürünü analiz et ve 3 lüks konsept öner.`;

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
              { inlineData: { mimeType, data: imageBase64 } },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.9,
        },
      }),
      ANALYZE_TIMEOUT_MS,
      "Ürün analizi",
    );
  } catch (e) {
    // SDK hatası iç detay içerebilir — logla, kullanıcıya genel mesaj dön.
    console.error("[gemini/analyze] API hatası:", e);
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

  let parsed: ProductAnalysis;
  try {
    parsed = JSON.parse(raw) as ProductAnalysis;
  } catch {
    throw new Error("Gemini yanıtı JSON olarak ayrıştırılamadı.");
  }

  if (!parsed.concepts?.length) {
    throw new Error("Konsept üretilemedi, lütfen tekrar deneyin.");
  }

  // En fazla 3 konsept ile sınırla.
  parsed.concepts = parsed.concepts.slice(0, 3);
  return parsed;
}
