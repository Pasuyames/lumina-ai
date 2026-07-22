import "server-only";
import { Type } from "@google/genai";
import { getGemini } from "@/lib/gemini/client";
import { serverEnv } from "@/lib/env";
import { withTimeout } from "@/lib/security/timeout";

/** Vision analizi için üst sınır — askıda kalan istek kullanıcıyı kilitlemesin. */
const ANALYZE_TIMEOUT_MS = 60_000;

export interface EnrichedPrompt {
  /** Görsel üretim modeline gidecek prompt (İngilizce). */
  prompt: string;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    prompt: { type: Type.STRING },
  },
  required: ["prompt"],
  propertyOrdering: ["prompt"],
};

const TEMPLATE_SYSTEM_PROMPT = `Sen lüks e-ticaret markaları için çalışan bir ürün fotoğrafçılığı sanat yönetmenisin.
Sana bir HAZIR SAHNE ŞABLONU (sabit bir stüdyo konsepti) ve gerçek bir ürün fotoğrafı veriliyor.
Görevin şablonun sahne KİMLİĞİNİ (zemin/materyal, ışık yönü ve sıcaklığı, kompozisyon, kamera
açısı, atmosfer) DEĞİŞTİRMEDEN, bu ürüne özel hale getirilmiş TEK bir üretim promptu yazmak.

Kurallar:
- Şablonun temel sahne konseptini KORU — zemin türünü, ışık kurulumunu, kompozisyonu ve genel
  atmosferi değiştirme; bunlar tasarım kararı olarak zaten verilmiş durumda.
- Ürünün fotoğrafını incele: kategorisini, materyalini, rengini, oranlarını ve yüzey
  özelliklerini (parlak/mat/şeffaf/dokulu) belirle. Bu detayları şablon sahnesine ENTEGRE ET —
  örn. ürün metal ve parlaksa ışığın metalde nasıl kırılacağını, ürün kadifeyse dokunun ışıkla
  nasıl etkileşeceğini belirt.
- Ürünün ORİJİNAL şeklini, rengini, yapısını ve dokusunu KORUMASI gerektiğini vurgula;
  yalnızca sahnenin ürüne özel render detayları zenginleşsin.
- Sonuç TEK bir İngilizce prompt olmalı: zemin/materyal, ışık yönü ve sıcaklığı, gölge ve
  yansıma, atmosfer, kompozisyon ve kamera açısı içermeli — şablon promptundan daha spesifik
  ve ürüne özel, ama aynı sahne kimliğinde.
- Şablon promptunun ruhundan ASLA sapma; sadece derinleştir.`;

const CUSTOM_SYSTEM_PROMPT = `Sen lüks e-ticaret markaları için çalışan bir ürün fotoğrafçılığı sanat yönetmenisin.
Kullanıcı sana kendi kelimeleriyle bir sahne fikri (yaratıcı niyet) yazdı. Sana ayrıca gerçek
ürünün fotoğrafı veriliyor. Görevin bu niyeti, ürünü inceleyerek, teknik açıdan eksiksiz ve
üretime hazır TEK bir görsel üretim promptuna dönüştürmek.

Kurallar:
- Kullanıcının NİYETİNE SADIK KAL — istediği ortamı, ruh halini, rengi veya konsepti DEĞİŞTİRME
  ya da başka bir şeye çevirme; sadece eksik teknik detayları tamamla.
- Ürünün fotoğrafını incele: kategorisini, materyalini, rengini, oranlarını ve yüzey
  özelliklerini belirle; bunları sahneye teknik olarak nasıl entegre edileceğini düşün.
- Kullanıcının belirtmediği ama gerekli teknik unsurları SEN ekle: zemin/materyal, ışık yönü ve
  sıcaklığı, gölge ve yansıma, atmosfer, kompozisyon ve kamera açısı.
- Kullanıcı çok kısa/az detaylı yazmış olsa bile niyetini genişlet, asla reddetme veya boş
  bırakma.
- Ürünün ORİJİNAL şeklini, rengini, yapısını ve dokusunu KORUMASI gerektiğini vurgula; yalnızca
  arka plan, ışık, zemin, yansıma ve atmosfer değişebilir.
- Sonuç TEK bir İngilizce prompt olmalı, üretime hazır ve detaylı.`;

/**
 * "Hazır Stüdyolar" zenginleştirmesi — şablonun sabit sahne konseptini koruyarak,
 * gerçek ürünü tarayıp ürüne özel detaylarla derinleştirilmiş TEK prompt üretir.
 * Maliyet: sadece metin/vision (görsel üretim YOK), kredi düşmez.
 */
export async function enrichTemplatePrompt(
  imageBase64: string,
  mimeType: string,
  baseTitle: string,
  basePrompt: string,
  categoryHint?: string,
): Promise<EnrichedPrompt> {
  const ai = getGemini();

  const userText =
    `Şablon başlığı: "${baseTitle}"\n` +
    `Şablon sahne promptu (temel konsept, korunmalı): "${basePrompt}"\n` +
    (categoryHint ? `Kullanıcının belirttiği kategori ipucu: "${categoryHint}".\n` : "") +
    `Bu ürün için, şablonun sahne konseptini koruyarak, ürüne özel detaylarla zenginleştirilmiş TEK bir üretim promptu yaz.`;

  let response;
  try {
    response = await withTimeout(
      ai.models.generateContent({
        model: serverEnv.geminiVisionModel,
        contents: [
          {
            role: "user",
            parts: [
              { text: `${TEMPLATE_SYSTEM_PROMPT}\n\n${userText}` },
              { inlineData: { mimeType, data: imageBase64 } },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.6,
        },
      }),
      ANALYZE_TIMEOUT_MS,
      "Şablon zenginleştirme",
    );
  } catch (e) {
    console.error("[gemini/architect] API hatası (template):", e);
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

  let parsed: EnrichedPrompt;
  try {
    parsed = JSON.parse(raw) as EnrichedPrompt;
  } catch {
    throw new Error("Gemini yanıtı JSON olarak ayrıştırılamadı.");
  }

  if (!parsed.prompt?.trim()) {
    throw new Error("Şablon zenginleştirilemedi, lütfen tekrar deneyin.");
  }

  return parsed;
}

/**
 * "Kendi Promptunuz" zenginleştirmesi — kullanıcının serbest metnini yaratıcı
 * niyet olarak alıp, gerçek ürünü tarayıp teknik açıdan eksiksiz bir üretim
 * promptuna dönüştürür. Maliyet: sadece metin/vision (görsel üretim YOK),
 * kredi düşmez.
 */
export async function enrichCustomPrompt(
  imageBase64: string,
  mimeType: string,
  userIntent: string,
  categoryHint?: string,
): Promise<EnrichedPrompt> {
  const ai = getGemini();

  const userText =
    `Kullanıcının yaratıcı niyeti (Türkçe olabilir, İngilizce'ye çevrilip zenginleştirilecek): "${userIntent}"\n` +
    (categoryHint ? `Kullanıcının belirttiği kategori ipucu: "${categoryHint}".\n` : "") +
    `Bu ürün için, kullanıcının niyetine sadık kalarak, teknik açıdan eksiksiz bir üretim promptu yaz.`;

  let response;
  try {
    response = await withTimeout(
      ai.models.generateContent({
        model: serverEnv.geminiVisionModel,
        contents: [
          {
            role: "user",
            parts: [
              { text: `${CUSTOM_SYSTEM_PROMPT}\n\n${userText}` },
              { inlineData: { mimeType, data: imageBase64 } },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.8,
        },
      }),
      ANALYZE_TIMEOUT_MS,
      "Özel prompt zenginleştirme",
    );
  } catch (e) {
    console.error("[gemini/architect] API hatası (custom):", e);
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

  let parsed: EnrichedPrompt;
  try {
    parsed = JSON.parse(raw) as EnrichedPrompt;
  } catch {
    throw new Error("Gemini yanıtı JSON olarak ayrıştırılamadı.");
  }

  if (!parsed.prompt?.trim()) {
    throw new Error("Prompt zenginleştirilemedi, lütfen tekrar deneyin.");
  }

  return parsed;
}
