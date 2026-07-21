/** Render kalitesine göre kredi maliyeti hesaplama. */

export type RenderQuality = "2K" | "4K";

/** 2K = 1 kredi, 4K = 2 kredi. Tek doğruluk kaynağı — sunucu ve istemci burayı kullanır. */
export function creditCostFor(quality: RenderQuality): number {
  return quality === "4K" ? 2 : 1;
}

/** Satış Seti = 4 kare (packshot/context/detail/hero), her kare quality'ye göre creditCostFor kadar tutar. */
export const SALES_SET_SHOT_COUNT = 4;

/** Satış Seti toplam kredi maliyeti: 4 kare × kalite başına maliyet (2K → 4, 4K → 8). */
export function salesSetCreditCost(quality: RenderQuality): number {
  return SALES_SET_SHOT_COUNT * creditCostFor(quality);
}

/**
 * Harcanan krediden render kalitesini geri çıkarır (creditCostFor'un tersi).
 * Kare başına harcama esas alındığı için Satış Seti kayıtları için de doğrudur.
 */
export function qualityLabelFor(creditsSpent: number): RenderQuality {
  return creditsSpent >= 2 ? "4K" : "2K";
}
