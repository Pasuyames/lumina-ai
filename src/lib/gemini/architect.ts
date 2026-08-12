import "server-only";
import { Type } from "@google/genai";
import { getGemini } from "@/lib/gemini/client";
import { serverEnv } from "@/lib/env";
import { withTimeout } from "@/lib/security/timeout";
import {
  ART_DIRECTOR_ROLE,
  FORBIDDEN_CHEAP_SURFACES,
  LUXURY_CAMPAIGN_BAR,
  PRESERVE_PRODUCT_INTEGRITY,
  CALIBRATION_EXAMPLES,
  SECTOR_EXPERTISE_INSTRUCTION,
  MULTI_ANGLE_INSTRUCTION,
  type ProductImage,
} from "@/lib/gemini/prompt-kit";

/** Vision analizi için üst sınır — askıda kalan istek kullanıcıyı kilitlemesin. */
const ANALYZE_TIMEOUT_MS = 60_000;

export interface EnrichedPrompt {
  /** Görsel üretim modeline gidecek prompt (İngilizce). */
  prompt: string;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    observations: { type: Type.STRING },
    prompt: { type: Type.STRING },
  },
  required: ["observations", "prompt"],
  propertyOrdering: ["observations", "prompt"],
};

const TEMPLATE_SYSTEM_PROMPT = `${ART_DIRECTOR_ROLE}
Sana bir HAZIR SAHNE ŞABLONU (sabit bir stüdyo konsepti) ve gerçek bir ürün fotoğrafı veriliyor.
Görevin şablonun sahne KİMLİĞİNİ (zemin/materyal, ışık yönü ve sıcaklığı, kompozisyon, kamera
açısı, atmosfer) DEĞİŞTİRMEDEN, bu ürüne özel hale getirilmiş TEK bir üretim promptu yazmak.

Kurallar:
- Şablonun temel sahne konseptini KORU — zemin türünü, ışık kurulumunu, kompozisyonu ve genel
  atmosferi değiştirme; bunlar tasarım kararı olarak zaten verilmiş durumda.
- "observations" alanına önce ürünü incele: kategorisini, materyalini, rengini, oranlarını ve
  yüzey özelliklerini (parlak/mat/şeffaf/dokulu) kısaca not et; "prompt" alanını bu nota göre yaz.
- Bu detayları şablon sahnesine ENTEGRE ET — örn. ürün metal ve parlaksa ışığın metalde nasıl
  kırılacağını, ürün kadifeyse dokunun ışıkla nasıl etkileşeceğini belirt.
- ${PRESERVE_PRODUCT_INTEGRITY} Yalnızca sahnenin ürüne özel render detayları zenginleşsin.
- Sonuç TEK bir İngilizce prompt olmalı: zemin/materyal, ışık yönü ve sıcaklığı, gölge ve
  yansıma, atmosfer, kompozisyon ve kamera açısı içermeli — şablon promptundan daha spesifik
  ve ürüne özel, ama aynı sahne kimliğinde.
- Şablon promptunun ruhundan ASLA sapma; sadece derinleştir.

${CALIBRATION_EXAMPLES}

${SECTOR_EXPERTISE_INSTRUCTION}`;

const CUSTOM_SYSTEM_PROMPT = `${ART_DIRECTOR_ROLE}
Kullanıcı sana kendi kelimeleriyle bir sahne fikri (yaratıcı niyet) yazdı. Sana ayrıca gerçek
ürünün fotoğrafı veriliyor. Görevin bu niyeti, ürünü inceleyerek, teknik açıdan eksiksiz ve
üretime hazır TEK bir görsel üretim promptuna dönüştürmek.

Kurallar:
- Kullanıcının NİYETİNE SADIK KAL — istediği ortamı, ruh halini, rengi veya konsepti DEĞİŞTİRME
  ya da başka bir şeye çevirme; sadece eksik teknik detayları tamamla.
- "observations" alanına önce ürünü incele: kategorisini, materyalini, rengini, oranlarını ve
  yüzey özelliklerini kısaca not et; bunları sahneye teknik olarak nasıl entegre edeceğini
  "prompt" alanını yazarken kullan.
- Kullanıcının belirtmediği ama gerekli teknik unsurları SEN ekle: zemin/materyal, ışık yönü ve
  sıcaklığı, gölge ve yansıma, atmosfer, kompozisyon ve kamera açısı.
- Kullanıcı çok kısa/az detaylı yazmış olsa bile niyetini genişlet, asla reddetme veya boş
  bırakma.
- ${PRESERVE_PRODUCT_INTEGRITY} Yalnızca arka plan, ışık, zemin, yansıma ve atmosfer değişebilir.
- Kullanıcının niyeti belirgin bir zemin/ortam belirtmiyorsa ${FORBIDDEN_CHEAP_SURFACES}
- ${LUXURY_CAMPAIGN_BAR}
- Sonuç TEK bir İngilizce prompt olmalı, üretime hazır ve detaylı.

${CALIBRATION_EXAMPLES}

${SECTOR_EXPERTISE_INSTRUCTION}`;

/**
 * "Hazır Stüdyolar" zenginleştirmesi — şablonun sabit sahne konseptini koruyarak,
 * gerçek ürünü tarayıp ürüne özel detaylarla derinleştirilmiş TEK prompt üretir.
 * Maliyet: sadece metin/vision (görsel üretim YOK), kredi düşmez.
 */
export async function enrichTemplatePrompt(
  images: ProductImage[],
  baseTitle: string,
  basePrompt: string,
  categoryHint?: string,
): Promise<EnrichedPrompt> {
  const ai = getGemini();

  const baseUserText =
    `Şablon başlığı: "${baseTitle}"\n` +
    `Şablon sahne promptu (temel konsept, korunmalı): "${basePrompt}"\n` +
    (categoryHint ? `Kullanıcının belirttiği kategori ipucu: "${categoryHint}".\n` : "") +
    `Bu ürün için, şablonun sahne konseptini koruyarak, ürüne özel detaylarla zenginleştirilmiş TEK bir üretim promptu yaz.`;
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
              { text: `${TEMPLATE_SYSTEM_PROMPT}\n\n${userText}` },
              ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } })),
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
  images: ProductImage[],
  userIntent: string,
  categoryHint?: string,
): Promise<EnrichedPrompt> {
  const ai = getGemini();

  const baseUserText =
    `Kullanıcının yaratıcı niyeti (Türkçe olabilir, İngilizce'ye çevrilip zenginleştirilecek): "${userIntent}"\n` +
    (categoryHint ? `Kullanıcının belirttiği kategori ipucu: "${categoryHint}".\n` : "") +
    `Bu ürün için, kullanıcının niyetine sadık kalarak, teknik açıdan eksiksiz bir üretim promptu yaz.`;
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
              { text: `${CUSTOM_SYSTEM_PROMPT}\n\n${userText}` },
              ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } })),
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
