import { describe, expect, it } from "vitest";
import { creditCostFor } from "@/lib/credits";

describe("creditCostFor", () => {
  it("2K için 1 kredi döner", () => {
    expect(creditCostFor("2K")).toBe(1);
  });

  it("4K için 2 kredi döner", () => {
    expect(creditCostFor("4K")).toBe(2);
  });
});
