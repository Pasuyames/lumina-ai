/**
 * Satış Seti (C10) — kare türleri ve türe bağlı sabitler.
 * "server-only" İÇERMEZ: hem sunucu (gemini/sales-set.ts, studio/actions.ts)
 * hem istemci (SalesSetPanel/SalesSetResult) bu dosyayı içe aktarabilir.
 */

export type SalesShotType = "packshot" | "context" | "detail" | "hero";

/** Sabit sıra: pazaryeri ana görseli → kullanım anı → detay → vitrin sahnesi. */
export const SALES_SET_SHOT_TYPES: readonly SalesShotType[] = [
  "packshot",
  "context",
  "detail",
  "hero",
];

/** Kare türüne göre sabit en-boy oranı — kullanıcı seçmez, sahneye göre önceden belirlenmiştir. */
export const SHOT_ASPECT_RATIOS: Record<SalesShotType, string> = {
  packshot: "1:1",
  context: "4:5",
  detail: "1:1",
  hero: "4:5",
};

/** Vision başlık üretmezse/eksik kalırsa kullanılan yedek Türkçe başlıklar. */
export const SHOT_FALLBACK_TITLES: Record<SalesShotType, string> = {
  packshot: "Ana Görsel",
  context: "Model Üstünde",
  detail: "Detay Çekimi",
  hero: "Vitrin Sahnesi",
};

/** Panelde kare üretilmeden önce gösterilen kısa Türkçe açıklamalar. */
export const SHOT_DESCRIPTIONS: Record<SalesShotType, string> = {
  packshot: "Beyaz fon, pazaryeri ana görseli",
  context: "Model üstünde veya kullanım anında",
  detail: "Doku, dikiş, donanım — makro detay",
  hero: "Premium atmosferik vitrin sahnesi",
};

export interface SalesShot {
  /** Kare türü — sabit 4'lü set. */
  type: SalesShotType;
  /** Kullanıcıya gösterilen başlık (Türkçe). */
  title: string;
  /** Görsel üretim modeline gidecek prompt (İngilizce). */
  prompt: string;
}

export interface SalesSetAnalysis {
  /** Ürünün kısa özeti (Türkçe). */
  productSummary: string;
  /** Ürün giyilebilir mi (çanta/saat/takı/aksesuar) — context karesinin modelli mi elle mi olacağını belirler. */
  wearable: boolean;
  shots: SalesShot[];
}

/**
 * Vision yanıtındaki `shots` dizisini doğrular ve sabit sıraya (packshot → context →
 * detail → hero) normalize eder. Saf fonksiyon — API çağrısı yapmaz, env/ağ bağımlılığı
 * yoktur; hem sunucuda (gemini/sales-set.ts) hem birim testlerde kullanılır.
 * Eksik/fazla kare, tekrarlanan tür veya boş prompt durumunda anlaşılır bir Türkçe hata
 * fırlatır; eksik başlık SHOT_FALLBACK_TITLES ile tamamlanır.
 */
export function normalizeShots(input: unknown): SalesSetAnalysis {
  if (!input || typeof input !== "object") {
    throw new Error("Vision yanıtı geçersiz.");
  }
  const raw = input as Partial<SalesSetAnalysis>;
  const shots = Array.isArray(raw.shots) ? raw.shots : [];
  if (shots.length !== 4) {
    throw new Error(
      `Satış seti için tam 4 kare gerekli, ${shots.length} alındı.`,
    );
  }

  const seen = new Set<SalesShotType>();
  const byType = new Map<SalesShotType, SalesShot>();

  for (const rawShot of shots) {
    if (!rawShot || typeof rawShot !== "object") {
      throw new Error("Kare verisi geçersiz.");
    }
    const candidate = rawShot as Partial<SalesShot>;
    const type = candidate.type as SalesShotType;
    if (!SALES_SET_SHOT_TYPES.includes(type)) {
      throw new Error(`Bilinmeyen kare türü: "${String(candidate.type)}".`);
    }
    if (seen.has(type)) {
      throw new Error(`Kare türü tekrarlanamaz: "${type}".`);
    }
    const title =
      typeof candidate.title === "string" ? candidate.title.trim() : "";
    const prompt =
      typeof candidate.prompt === "string" ? candidate.prompt.trim() : "";
    if (!prompt) {
      throw new Error(`"${type}" karesi için prompt eksik.`);
    }
    seen.add(type);
    byType.set(type, {
      type,
      title: title || SHOT_FALLBACK_TITLES[type],
      prompt,
    });
  }

  for (const t of SALES_SET_SHOT_TYPES) {
    if (!seen.has(t)) throw new Error(`Eksik kare türü: "${t}".`);
  }

  return {
    productSummary:
      typeof raw.productSummary === "string" ? raw.productSummary.trim() : "",
    wearable: Boolean(raw.wearable),
    // Sabit sırayla döndür: packshot, context, detail, hero.
    shots: SALES_SET_SHOT_TYPES.map((t) => byType.get(t)!),
  };
}
