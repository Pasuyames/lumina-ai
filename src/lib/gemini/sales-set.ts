import "server-only";
import { Type } from "@google/genai";
import { getGemini } from "@/lib/gemini/client";
import { serverEnv } from "@/lib/env";
import { withTimeout } from "@/lib/security/timeout";
import {
  SHOT_ASPECT_RATIOS,
  SHOT_FALLBACK_TITLES,
  normalizeShots,
  type SalesShotType,
  type SalesShot,
  type SalesSetAnalysis,
} from "@/lib/sales-set-shots";

// Geriye dönük uyumluluk: bu sabitler/tipler/fonksiyon önceden burada
// tanımlıydı, çağıranlar (studio/actions.ts) hâlâ bu modülden içe aktarabilir.
export { SHOT_ASPECT_RATIOS, SHOT_FALLBACK_TITLES, normalizeShots };
export type { SalesShotType, SalesShot, SalesSetAnalysis };

/** Vision analizi için üst sınır — askıda kalan istek kullanıcıyı kilitlemesin. */
const ANALYZE_TIMEOUT_MS = 60_000;

/**
 * Her render promptunun sonuna eklenen sabit hiper-gerçekçilik çıpası.
 * Vision modelinin promptu unutması ihtimaline karşı çağıran taraf (studio/actions.ts)
 * bunu HER ZAMAN prompt'a ekler — generate.ts'teki PRESERVE_INSTRUCTION deseniyle aynı mantık.
 */
export const REALISM_ANCHOR =
  "authentic professional DSLR photograph, natural imperfect lighting, " +
  "true-to-life fabric and skin texture, subtle film grain, realistic depth of field, " +
  "absolutely no CGI or plastic AI look";

const SYSTEM_PROMPT = `Sen lüks e-ticaret markaları için çalışan bir ürün fotoğrafçılığı sanat yönetmenisin.
Ürünü analiz et ve 4 standart listeleme karesi için render promptu üret:

1. PACKSHOT — kusursuz beyaz seamless fon, yumuşak eşit stüdyo ışığı, önden merkez kadraj,
   zeminde hafif doğal gölge, pazaryeri ana görseli.
2. CONTEXT — ürün GİYİLEBİLİRSE (çanta/saat/takı/aksesuar): gerçek bir insan modelin üstünde,
   doğal duruş; MODELİN YÜZÜ KESİNLİKLE KADRAJ DIŞI (omuz/çene hizasında kırpılmış —
   e-ticaret standardı). Giyilebilir değilse: ürünü doğal bir kullanım anında elle
   etkileşimli göster.
3. DETAIL — makro detay: doku, dikiş, donanım/kapak gibi kalite kanıtı bir bölge,
   sığ alan derinliği.
4. HERO — ürünün segmentine uygun premium atmosferik editoryal sahne.

HER promptun sonuna şu gerçekçilik çıpalarını İngilizce ekle: "authentic professional DSLR
photograph, natural imperfect lighting, true-to-life fabric and skin texture, subtle film
grain, realistic depth of field, absolutely no CGI or plastic AI look".

Kurallar:
- "productSummary" TÜRKÇE, kısa bir ürün özeti.
- "wearable": ürün giyilebilir/takılabilir bir aksesuarsa true, değilse false.
- "shots" tam olarak 4 eleman içermeli; "type" alanları sırasıyla "packshot", "context",
  "detail", "hero" olmalı (her biri bir kez).
- "title" alanları TÜRKÇE (kullanıcıya gösterilecek), örn. "Ana Görsel", "Model Üstünde",
  "Detay Çekimi", "Vitrin Sahnesi".
- "prompt" alanları İNGİLİZCE ve detaylı olmalı: zemin/materyal, ışık yönü ve sıcaklığı,
  gölge ve yansıma, atmosfer, kompozisyon ve kamera açısı içermeli.
- Her prompt, ürünün ORİJİNAL şeklini, rengini, yapısını ve dokusunu KORUMASI gerektiğini
  vurgulamalı — yalnızca arka plan, ışık, zemin, yansıma ve (context karesinde) kullanım
  bağlamı değişmeli.
- Ürün algısını UCUZLATAN sahnelerden kaçın: sıradan/rustik ahşap masa üstü, dağınık ev
  ortamı, mutfak tezgâhı, ucuz plastik yüzeyler YASAK (özellikle HERO ve CONTEXT
  karelerinde). Zeminler daima premium olmalı: mermer, doğal taş, kadife, saten, cam,
  lake veya fırçalanmış metal. Ahşap yalnızca lüks bağlamda kabul edilebilir (koyu
  ceviz, yüksek cila, butik vitrin sunumu).`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    productSummary: { type: Type.STRING },
    wearable: { type: Type.BOOLEAN },
    shots: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: ["packshot", "context", "detail", "hero"],
          },
          title: { type: Type.STRING },
          prompt: { type: Type.STRING },
        },
        required: ["type", "title", "prompt"],
        propertyOrdering: ["type", "title", "prompt"],
      },
    },
  },
  required: ["productSummary", "wearable", "shots"],
  propertyOrdering: ["productSummary", "wearable", "shots"],
};

/**
 * Satış Seti (C10) — Gemini Vision ile ürün analizi + 4 standart listeleme karesi promptu.
 * Maliyet: sadece metin/vision (görsel üretim YOK), kredi düşmez.
 */
export async function analyzeForSalesSet(
  imageBase64: string,
  mimeType: string,
  categoryHint?: string,
): Promise<SalesSetAnalysis> {
  const ai = getGemini();

  const userText = categoryHint
    ? `Kullanıcının belirttiği kategori ipucu: "${categoryHint}". Bu ürünü analiz et ve 4 karelik satış setini üret.`
    : `Bu ürünü analiz et ve 4 karelik satış setini üret.`;

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
          temperature: 0.7,
        },
      }),
      ANALYZE_TIMEOUT_MS,
      "Satış seti analizi",
    );
  } catch (e) {
    // SDK hatası iç detay içerebilir — logla, kullanıcıya genel mesaj dön.
    console.error("[gemini/sales-set] API hatası:", e);
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

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gemini yanıtı JSON olarak ayrıştırılamadı.");
  }

  return normalizeShots(parsed);
}
