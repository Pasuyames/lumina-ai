/** Render kalitesine göre kredi maliyeti hesaplama. */

export type RenderQuality = "2K" | "4K";

/** 2K = 1 kredi, 4K = 2 kredi. Tek doğruluk kaynağı — sunucu ve istemci burayı kullanır. */
export function creditCostFor(quality: RenderQuality): number {
  return quality === "4K" ? 2 : 1;
}
