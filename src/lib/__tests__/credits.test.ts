import { describe, expect, it } from "vitest";
import { creditCostFor, salesSetCreditCost } from "@/lib/credits";

describe("creditCostFor", () => {
  it("2K için 1 kredi döner", () => {
    expect(creditCostFor("2K")).toBe(1);
  });

  it("4K için 2 kredi döner", () => {
    expect(creditCostFor("4K")).toBe(2);
  });
});

describe("salesSetCreditCost", () => {
  it("2K için 4 kare × 1 kredi = 4 kredi döner", () => {
    expect(salesSetCreditCost("2K")).toBe(4);
  });

  it("4K için 4 kare × 2 kredi = 8 kredi döner", () => {
    expect(salesSetCreditCost("4K")).toBe(8);
  });
});
