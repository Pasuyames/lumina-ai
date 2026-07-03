import { describe, expect, it } from "vitest";
import { safeInternalPath } from "@/lib/security/redirect";

describe("safeInternalPath", () => {
  it("geçerli site içi yolu aynen döner", () => {
    expect(safeInternalPath("/dashboard")).toBe("/dashboard");
  });

  it("protokol-göreli açık yönlendirmeyi (//evil.com) reddeder", () => {
    expect(safeInternalPath("//evil.com")).toBe("/dashboard");
  });

  it("mutlak dış URL'yi (https://evil.com) reddeder", () => {
    expect(safeInternalPath("https://evil.com")).toBe("/dashboard");
  });

  it("ters slash içeren yolu (/a\\b) reddeder", () => {
    expect(safeInternalPath("/a\\b")).toBe("/dashboard");
  });
});
