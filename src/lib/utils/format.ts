/** Biçimlendirme yardımcıları. */

/** Kuruş → yerelleştirilmiş para birimi metni. */
export function formatPrice(cents: number, currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** ISO tarih → "30 Haz 2026" gibi kısa Türkçe tarih. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** "kredi" sözcüğünü sayıya göre çekimle. */
export function creditLabel(n: number): string {
  return `${n} kredi`;
}
