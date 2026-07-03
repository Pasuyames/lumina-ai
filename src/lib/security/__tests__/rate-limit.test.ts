import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "@/lib/security/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("limit içindeyken ok:true döner", () => {
    const key = `test-${Math.random()}`;
    const r1 = checkRateLimit(key, 3, 60_000);
    const r2 = checkRateLimit(key, 3, 60_000);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
  });

  it("limit aşıldığında ok:false ve retryAfterSec >= 1 döner", () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);
    const r3 = checkRateLimit(key, 2, 60_000);
    expect(r3.ok).toBe(false);
    expect(r3.retryAfterSec).toBeGreaterThanOrEqual(1);
  });

  it("pencere geçtikten sonra tekrar izin verir", () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 1, 60_000);
    const blocked = checkRateLimit(key, 1, 60_000);
    expect(blocked.ok).toBe(false);

    vi.advanceTimersByTime(60_001);

    const allowed = checkRateLimit(key, 1, 60_000);
    expect(allowed.ok).toBe(true);
  });
});
