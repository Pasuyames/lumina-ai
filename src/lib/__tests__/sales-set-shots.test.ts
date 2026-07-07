import { describe, expect, it } from "vitest";
import { normalizeShots } from "@/lib/sales-set-shots";

function validShots() {
  return {
    productSummary: "Deri el çantası",
    wearable: true,
    shots: [
      { type: "hero", title: "Vitrin Sahnesi", prompt: "premium editorial scene" },
      { type: "packshot", title: "Ana Görsel", prompt: "white seamless studio shot" },
      { type: "detail", title: "Detay Çekimi", prompt: "macro stitching detail" },
      { type: "context", title: "Model Üstünde", prompt: "worn by a model, face out of frame" },
    ],
  };
}

describe("normalizeShots", () => {
  it("geçerli 4 kareyi sabit sıraya (packshot, context, detail, hero) diziler", () => {
    const result = normalizeShots(validShots());
    expect(result.shots.map((s) => s.type)).toEqual([
      "packshot",
      "context",
      "detail",
      "hero",
    ]);
    expect(result.wearable).toBe(true);
    expect(result.productSummary).toBe("Deri el çantası");
  });

  it("eksik başlığı SHOT_FALLBACK_TITLES ile tamamlar", () => {
    const input = validShots();
    input.shots[0] = { ...input.shots[0], title: "" };
    const result = normalizeShots(input);
    const hero = result.shots.find((s) => s.type === "hero")!;
    expect(hero.title).toBe("Vitrin Sahnesi");
  });

  it("4'ten az kare gelirse hata fırlatır", () => {
    const input = validShots();
    input.shots.pop();
    expect(() => normalizeShots(input)).toThrow(/tam 4 kare/);
  });

  it("4'ten fazla kare gelirse hata fırlatır", () => {
    const input = validShots();
    input.shots.push({ type: "packshot", title: "Fazladan", prompt: "x" });
    expect(() => normalizeShots(input)).toThrow(/tam 4 kare/);
  });

  it("tekrarlanan kare türünde hata fırlatır", () => {
    const input = validShots();
    input.shots[0] = { ...input.shots[1] }; // context'i tekrar eder, packshot eksik kalır
    expect(() => normalizeShots(input)).toThrow();
  });

  it("bilinmeyen kare türünde hata fırlatır", () => {
    const input = validShots();
    input.shots[0] = { type: "banner" as never, title: "?", prompt: "x" };
    expect(() => normalizeShots(input)).toThrow(/Bilinmeyen kare türü/);
  });

  it("eksik/boş prompt'ta hata fırlatır", () => {
    const input = validShots();
    input.shots[0] = { ...input.shots[0], prompt: "  " };
    expect(() => normalizeShots(input)).toThrow(/prompt eksik/);
  });

  it("shots dizisi olmayan girdide hata fırlatır", () => {
    expect(() => normalizeShots({})).toThrow(/tam 4 kare/);
    expect(() => normalizeShots(null)).toThrow(/geçersiz/);
    expect(() => normalizeShots("nope")).toThrow(/geçersiz/);
  });
});
