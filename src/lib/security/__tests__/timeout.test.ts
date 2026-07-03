import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { withTimeout } from "@/lib/security/timeout";

describe("withTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("süresinde çözülen promise'in değerini döner", async () => {
    const promise = withTimeout(Promise.resolve("tamam"), 1000, "İşlem");
    await expect(promise).resolves.toBe("tamam");
  });

  it("süresi aşan promise reject eder ve mesajda 'zaman aşımı' geçer", async () => {
    const neverResolves = new Promise<string>(() => {});
    const promise = withTimeout(neverResolves, 1000, "İşlem");

    const assertion = expect(promise).rejects.toThrow("zaman aşımı");
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });

  it("timer'ı temizler (başarılı durumda açık zamanlayıcı kalmaz)", async () => {
    const clearSpy = vi.spyOn(global, "clearTimeout");
    await withTimeout(Promise.resolve("x"), 1000, "İşlem");
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
