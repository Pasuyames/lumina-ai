import "server-only";
import { Type } from "@google/genai";
import { getGemini } from "@/lib/gemini/client";
import { serverEnv } from "@/lib/env";
import { withTimeout } from "@/lib/security/timeout";

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
- Ürünün ORİJİNAL şeklini, rengini, yapısını ve dokusunu KORUMASI gerektiğini vurgula; yalnızca
  arka plan, ışık, zemin, yansıma ve atmosfer değişebilir.
- Ucuzlatan sahnelerden kaçın: sıradan/rustik ahşap masa üstü, dağınık ev ortamı, mutfak tezgâhı
  YASAK. Cüretkarlık asla ucuzluk demek değil — her zaman yüksek bütçeli bir kampanya çekimi gibi
  hissettirmeli.
- "title" TÜRKÇE, kısa ve çarpıcı (kullanıcıya gösterilecek, ör. "Mor Dumanın İçinde").
- "prompt" İNGİLİZCE ve detaylı olmalı: zemin/materyal, ışık yönü ve sıcaklığı, gölge ve yansıma,
  atmosfer, kompozisyon ve kamera açısı içermeli.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    prompt: { type: Type.STRING },
  },
  required: ["title", "prompt"],
  propertyOrdering: ["title", "prompt"],
};

/**
 * Kreatif Üret (tek tık) — Gemini Vision ile ürüne özel, cüretkar TEK
 * kampanya sahnesi üretir. Maliyet: sadece metin/vision (görsel üretim YOK),
 * kredi düşmez; çağıran taraf sonucu doğrudan render'a gönderir.
 */
export async function analyzeForCreative(
  imageBase64: string,
  mimeType: string,
  categoryHint?: string,
): Promise<CreativeConcept> {
  const ai = getGemini();

  const userText = categoryHint
    ? `Kullanıcının belirttiği kategori ipucu: "${categoryHint}". Bu ürün için tek bir cüretkar kampanya sahnesi tasarla.`
    : `Bu ürün için tek bir cüretkar kampanya sahnesi tasarla.`;

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
