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

const SYSTEM_PROMPT = `${ART_DIRECTOR_ROLE}
Ürünü analiz et ve 4 standart listeleme karesi için render promptu üret:

1. PACKSHOT — kusursuz beyaz seamless fon, yumuşak ve eşit gölgesiz aydınlatma, önden merkez kadraj,
   zeminde hafif doğal gölge, pazaryeri ana görseli.
2. CONTEXT — ürün GİYİLEBİLİRSE:
   - Yüzde giyilen ürünlerde (gözlük, güneş gözlüğü): modelin yüzü kadrajda kalabilir;
     göğüs/omuz hizasından yukarısını gösteren ORTA PLAN bir çekim kullan. Kamera
     çoğunlukla tam karşıdan veya çok hafif açıyla olsun — aşırı yakın makro veya
     dramatik profil açısından KAÇIN, ürün net ve bütün görünmeli.
   - Bilek/boyun/el üzerinde giyilen ürünlerde (saat, kolye, bilezik, yüzük, çanta):
     gerçek bir insan modelin üstünde, doğal duruş; MODELİN YÜZÜ KESİNLİKLE KADRAJ
     DIŞI (omuz/çene hizasında kırpılmış — e-ticaret standardı).
   - Giyilebilir değilse: ürünü doğal bir kullanım anında elle etkileşimli göster.
3. DETAIL — ürünü TEK BAŞINA değil, gerçek bir MODEL ÜZERİNDE (veya elde tutarken)
   çok yakından göster; GERÇEK bir makro/yakın çekim olmaya devam eder ama artık
   tamamen izole değil, doğal bir ölçek referansı (cilt, el, parmak) kadrajda kalır:
   - Yüzde giyilen ürünlerde (gözlük, güneş gözlüğü): kadraj, modelin yüz/baş
     bölgesinin sadece küçük bir köşesini (şakak, kulak üstü, elmacık kemiği hizası)
     VE gözlüğün o bölgedeki donanım/malzeme detayını (menteşe, logo, kol ucu)
     doldurmalı — CONTEXT'in orta plan çekiminden BELİRGİN ŞEKİLDE daha yakın,
     neredeyse makro; ama detayın yanında cilt/saç gibi doğal bir ölçek referansı
     MUTLAKA görünmeli.
   - Bilek/boyun/el üzerinde giyilen ürünlerde (saat, kolye, bilezik, yüzük, çanta):
     kadraj bilek/boyun/elin sadece bir kısmını VE ürünün donanım detayını (kapak,
     kilit, toka, kadran) doldurmalı; MODELİN YÜZÜ KESİNLİKLE KADRAJ DIŞI (CONTEXT'teki
     kuralla aynı).
   - Giyilebilir değilse: ürünü elinde tutan/kullanan bir modelin, ürünün donanım/
     malzeme detayına çok yakın odaklanan çekimi — elin/parmakların bir kısmı
     kadrajda kalarak ürüne ölçek versin.
   Her dalda ortak: logo/amblem varsa konumunu DEĞİŞTİRME (üründeki yerinde, sadece
   yakından çerçevele); sığ alan derinliği (bokeh) ile ön planı öne çıkar;
   PACKSHOT'tan (tam ürün, geniş kadraj, model YOK) kompozisyon olarak BELİRGİN
   ŞEKİLDE farklı olmalı; detayın kendisi dahi tanınamayacak kadar soyut bir yüzey
   kesitine indirgenecek şekilde AŞIRI yakınlaşma YAPMA.
4. HERO — ürüne ÖZEL, benzersiz bir premium editoryal vitrin sahnesi tasarla. Şablon bir
   "podyum + boş fon" sahnesi ÜRETME. Sahnenin zemin/prop/renk paleti/atmosfer seçimini
   doğrudan BU ürünün kendi materyaline, rengine ve yukarıda çıkardığın productSummary'ye
   dayandır (materyale/sektöre göre nasıl bir zemin/ışık/prop uygun olacağına kendin karar
   ver — CALIBRATION_EXAMPLES ve sektör bilginden yararlan). Sahne, bu ürünün hedef
   kitlesinin yaşam tarzını/estetiğini yansıtan somut bir konsept fikri taşımalı, rastgele
   süslemeler değil. Farklı ürünler için sahne birbirinden gözle görülür şekilde
   farklılaşmalı — aynı "podyum + bokeh ışık" kompozisyonunu her ürüne tekrarlama.

Kurallar:
- "productSummary" TÜRKÇE — sadece genel bir özet değil, ürünün materyalini, rengini,
  yüzey özelliğini (parlak/mat/şeffaf/dokulu), oranlarını ve varsa kırılgan/dikkat
  gerektiren noktalarını (ör. ince kayış, cam yüzey, keskin köşe) somut şekilde not et.
  Bu gözlem, aşağıdaki 4 promptun ürüne özel detaylarının kaynağıdır.
- "wearable": ürün giyilebilir/takılabilir bir aksesuarsa true, değilse false.
- "shots" tam olarak 4 eleman içermeli; "type" alanları sırasıyla "packshot", "context",
  "detail", "hero" olmalı (her biri bir kez).
- "title" alanları TÜRKÇE (kullanıcıya gösterilecek), örn. "Ana Görsel", "Model Üstünde",
  "Detay Çekimi", "Vitrin Sahnesi".
- "prompt" alanları İNGİLİZCE ve detaylı olmalı: zemin/materyal, ışık yönü ve sıcaklığı,
  gölge ve yansıma, atmosfer, kompozisyon ve kamera açısı içermeli.
- ${PRESERVE_PRODUCT_INTEGRITY} Yalnızca arka plan, ışık, zemin, yansıma ve (context
  karesinde, giyilebilir ürünlerde ayrıca detail karesinde de) kullanım bağlamı
  değişebilir.
- ${FORBIDDEN_CHEAP_SURFACES} (özellikle HERO ve CONTEXT karelerinde geçerli.)
- HERO, CONTEXT ve (giyilebilir ürünlerde) DETAIL promptlarında: ${LUXURY_CAMPAIGN_BAR}
  Model içeren karelerde (CONTEXT ve giyilebilirse DETAIL) model/stil detayları da
  premium olsun (bakımlı eller, kaliteli kıyafet/cilt, zarif duruş).

${CALIBRATION_EXAMPLES}

${SECTOR_EXPERTISE_INSTRUCTION}`;

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
  images: ProductImage[],
  categoryHint?: string,
): Promise<SalesSetAnalysis> {
  const ai = getGemini();

  const baseUserText = categoryHint
    ? `Kullanıcının belirttiği kategori ipucu: "${categoryHint}". Bu ürünü analiz et ve 4 karelik satış setini üret.`
    : `Bu ürünü analiz et ve 4 karelik satış setini üret.`;
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

// ─────────────────────────────────────────────────────────────
// Tek kareyi yeniden üretme — kullanıcı 4'ün tamamını değil, sadece
// beğenmediği TEK kareyi (isteğe bağlı kendi briefiyle) yeniden üretmek
// istediğinde kullanılır. 4'lü SYSTEM_PROMPT'a dokunulmaz — çalışan akış
// riske atılmaz, kendi küçük rol tanımı setiyle çalışır.
// ─────────────────────────────────────────────────────────────

/** Her kare türünün yapısal rolü — 4'lü SYSTEM_PROMPT'taki tanımların kısa hali. */
const SHOT_TYPE_ROLE: Record<SalesShotType, string> = {
  packshot:
    "PACKSHOT — kusursuz beyaz seamless fon, yumuşak ve eşit gölgesiz aydınlatma, önden " +
    "merkez kadraj, zeminde hafif doğal gölge, pazaryeri ana görseli.",
  context:
    "CONTEXT — ürün GİYİLEBİLİRSE: Yüzde giyilen ürünlerde (gözlük, güneş " +
    "gözlüğü) modelin yüzü kadrajda kalabilir; göğüs/omuz hizasından " +
    "yukarısını gösteren ORTA PLAN bir çekim kullan, kamera çoğunlukla tam " +
    "karşıdan veya çok hafif açıyla olsun, aşırı yakın makro veya dramatik " +
    "profil açısından KAÇIN. Bilek/boyun/el üzerinde giyilen ürünlerde " +
    "(saat, kolye, bilezik, yüzük, çanta): gerçek bir insan modelin " +
    "üstünde, doğal duruş; MODELİN YÜZÜ KESİNLİKLE KADRAJ DIŞI (omuz/çene " +
    "hizasında kırpılmış — e-ticaret standardı). Giyilebilir değilse: " +
    "ürünü doğal bir kullanım anında elle etkileşimli göster.",
  detail:
    "DETAIL — ürünü TEK BAŞINA değil, gerçek bir MODEL ÜZERİNDE (veya elde " +
    "tutarken) çok yakından göster; GERÇEK bir makro/yakın çekim olmaya devam " +
    "eder ama artık tamamen izole değil, doğal bir ölçek referansı (cilt, el, " +
    "parmak) kadrajda kalır. Yüzde giyilen ürünlerde (gözlük, güneş gözlüğü): " +
    "kadraj modelin yüz/baş bölgesinin sadece küçük bir köşesini (şakak, kulak " +
    "üstü, elmacık kemiği hizası) VE gözlüğün o bölgedeki donanım/malzeme " +
    "detayını (menteşe, logo, kol ucu) doldurmalı — CONTEXT'in orta plan " +
    "çekiminden BELİRGİN ŞEKİLDE daha yakın, neredeyse makro; ama detayın " +
    "yanında cilt/saç gibi doğal bir ölçek referansı MUTLAKA görünmeli. Bilek/" +
    "boyun/el üzerinde giyilen ürünlerde (saat, kolye, bilezik, yüzük, çanta): " +
    "kadraj bilek/boyun/elin sadece bir kısmını VE ürünün donanım detayını " +
    "(kapak, kilit, toka, kadran) doldurmalı; MODELİN YÜZÜ KESİNLİKLE KADRAJ " +
    "DIŞI (CONTEXT'teki kuralla aynı). Giyilebilir değilse: ürünü elinde " +
    "tutan/kullanan bir modelin, ürünün donanım/malzeme detayına çok yakın " +
    "odaklanan çekimi — elin/parmakların bir kısmı kadrajda kalarak ürüne " +
    "ölçek versin. Her dalda ortak: logo/amblem varsa konumunu DEĞİŞTİRME " +
    "(üründeki yerinde, sadece yakından çerçevele); sığ alan derinliği " +
    "(bokeh) ile ön planı öne çıkar; PACKSHOT'tan (tam ürün, geniş kadraj, " +
    "model YOK) kompozisyon olarak BELİRGİN ŞEKİLDE farklı olmalı; detayın " +
    "kendisi dahi tanınamayacak kadar soyut bir yüzey kesitine indirgenecek " +
    "şekilde AŞIRI yakınlaşma YAPMA.",
  hero:
    "HERO — ürüne ÖZEL, benzersiz bir premium editoryal vitrin sahnesi tasarla. " +
    "Şablon bir \"podyum + boş fon\" sahnesi ÜRETME. Sahnenin zemin/prop/renk " +
    "paleti/atmosfer seçimini doğrudan BU ürünün kendi materyaline, rengine ve " +
    "yukarıda çıkardığın productSummary'ye dayandır (materyale/sektöre göre " +
    "nasıl bir zemin/ışık/prop uygun olacağına kendin karar ver — " +
    "CALIBRATION_EXAMPLES ve sektör bilginden yararlan). Sahne, bu ürünün hedef " +
    "kitlesinin yaşam tarzını/estetiğini yansıtan somut bir konsept fikri " +
    "taşımalı, rastgele süslemeler değil. Farklı ürünler için sahne birbirinden " +
    "gözle görülür şekilde farklılaşmalı — aynı \"podyum + bokeh ışık\" " +
    "kompozisyonunu her ürüne tekrarlama.",
};

export interface RegeneratedShot {
  title: string;
  prompt: string;
}

const REGENERATE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    observations: { type: Type.STRING },
    title: { type: Type.STRING },
    prompt: { type: Type.STRING },
  },
  required: ["observations", "title", "prompt"],
  propertyOrdering: ["observations", "title", "prompt"],
};

function buildRegenerateSystemPrompt(
  shotType: SalesShotType,
  hasBrief: boolean,
): string {
  const briefRule = hasBrief
    ? "Kullanıcı bu kare için kendi talimatını verdi — NİYETİNE SADIK KAL, " +
      "istediği ortamı/rengi/konsepti DEĞİŞTİRME; sadece eksik teknik detayları " +
      "tamamla ve karenin yukarıdaki yapısal rolünü (özellikle CONTEXT'teki ve " +
      "giyilebilir DETAIL'deki yüz/kadraj kuralları gibi zorunlu kısıtları) koru."
    : "Kullanıcı özel bir talimat vermedi — karenin rolüne sadık kalarak, " +
      "önceki üretimden BELİRGİN ŞEKİLDE FARKLI, yeni bir varyasyon tasarla " +
      "(farklı kompozisyon/zemin/ışık açısı dene).";

  return `${ART_DIRECTOR_ROLE}
Tek bir e-ticaret listeleme karesi için render promptu üret. Kare türü ve rolü:

${SHOT_TYPE_ROLE[shotType]}

${briefRule}

Kurallar:
- "observations" alanına önce ürünü incele: materyal, renk, yüzey özelliği ve
  oranlarını kısaca not et; "prompt" alanını bu nota göre yaz.
- "title" TÜRKÇE (kullanıcıya gösterilecek).
- "prompt" İNGİLİZCE ve detaylı olmalı: zemin/materyal, ışık yönü ve sıcaklığı,
  gölge ve yansıma, atmosfer, kompozisyon ve kamera açısı içermeli.
- ${PRESERVE_PRODUCT_INTEGRITY} Yalnızca arka plan, ışık, zemin, yansıma ve
  (context karesindeyse, ya da giyilebilir bir üründe detail karesindeyse
  ayrıca) kullanım bağlamı değişebilir.
- ${FORBIDDEN_CHEAP_SURFACES}
- ${LUXURY_CAMPAIGN_BAR}

${CALIBRATION_EXAMPLES}

${SECTOR_EXPERTISE_INSTRUCTION}`;
}

/**
 * Satış Seti'nde TEK bir kareyi (isteğe bağlı kullanıcı briefiyle) yeniden
 * üretmek için prompt üretir. Maliyet: sadece metin/vision (görsel üretim
 * YOK), kredi düşmez — çağıran taraf sonucu `renderSalesSetShot`'a geçirip
 * render eder.
 */
export async function regenerateSalesSetShot(
  images: ProductImage[],
  shotType: SalesShotType,
  categoryHint?: string,
  userBrief?: string,
): Promise<RegeneratedShot> {
  const ai = getGemini();
  const trimmedBrief = userBrief?.trim();
  const systemPrompt = buildRegenerateSystemPrompt(shotType, Boolean(trimmedBrief));

  const baseUserText =
    (categoryHint ? `Kullanıcının belirttiği kategori ipucu: "${categoryHint}".\n` : "") +
    (trimmedBrief ? `Kullanıcının bu kare için özel talimatı: "${trimmedBrief}"\n` : "") +
    `Bu ürün için "${shotType}" karesinin render promptunu yaz.`;
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
              { text: `${systemPrompt}\n\n${userText}` },
              ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } })),
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: REGENERATE_RESPONSE_SCHEMA,
          temperature: trimmedBrief ? 0.8 : 1.0,
        },
      }),
      ANALYZE_TIMEOUT_MS,
      "Kare yeniden üretim analizi",
    );
  } catch (e) {
    console.error("[gemini/sales-set] API hatası (regenerate):", e);
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

  let parsed: RegeneratedShot;
  try {
    parsed = JSON.parse(raw) as RegeneratedShot;
  } catch {
    throw new Error("Gemini yanıtı JSON olarak ayrıştırılamadı.");
  }

  if (!parsed.title?.trim() || !parsed.prompt?.trim()) {
    throw new Error("Kare yeniden üretilemedi, lütfen tekrar deneyin.");
  }

  return parsed;
}
