import "server-only";
import { headers } from "next/headers";

/**
 * Bellek içi kayan-pencere rate limiter.
 * Tek instance (Vercel tek bölge / tek Node süreci) için yeterlidir.
 * Çoklu instance'a ölçeklenirken Redis/Upstash tabanlı limiter'a geçirin.
 */
const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

export interface RateLimitResult {
  ok: boolean;
  /** Limit aşıldıysa kaç saniye sonra tekrar denenebilir. */
  retryAfterSec: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  // Seyrek global temizlik — eski anahtarlar bellekte birikmesin.
  if (now - lastSweep > 10 * 60 * 1000) {
    lastSweep = now;
    for (const [k, ts] of buckets) {
      if (ts.length === 0 || ts[ts.length - 1] < now - windowMs) {
        buckets.delete(k);
      }
    }
  }

  const cutoff = now - windowMs;
  const timestamps = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= limit) {
    buckets.set(key, timestamps);
    const retryAfterSec = Math.ceil((timestamps[0] + windowMs - now) / 1000);
    return { ok: false, retryAfterSec: Math.max(retryAfterSec, 1) };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return { ok: true, retryAfterSec: 0 };
}

/** İstemci IP'si (proxy arkasında x-forwarded-for'un ilk değeri). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "local";
}
