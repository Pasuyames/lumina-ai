/**
 * generate-template-refs.mjs
 *
 * Her şablonun galeri kartı için referans görsel üretir.
 * KULLANIM: node scripts/generate-template-refs.mjs [--dry-run] [--confirm] [--limit N]
 *
 * UYARI: Bu script Gemini görsel API'sini çağırır — GERÇEK PARA HARCAR.
 *        --dry-run (varsayılan) ile test edin.
 *        Gerçek üretim için --confirm + LUMINA_ALLOW_PAID=1 gereklidir.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TEMPLATES_DIR = join(ROOT, "src", "data", "templates");
const FIXTURES_DIR = join(ROOT, "scripts", "fixtures");
const OUTPUT_DIR = join(ROOT, "public", "templates");

const MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview";
const PRESERVE_INSTRUCTION =
  "CRITICAL: Preserve the original product's exact shape, structure, proportions, " +
  "material, color and texture without any distortion. Do not redesign or alter the " +
  "product itself. Only replace the background, surface, lighting, shadows and " +
  "reflections according to the scene below. Keep the product perfectly sharp and " +
  "in focus as the hero of a premium e-commerce photograph.";

/* ─── CLI argüman ayrıştırma ─── */

const args = process.argv.slice(2);
const DRY_RUN = !args.includes("--confirm");
const CONFIRMED = args.includes("--confirm");
const ALLOW_PAID = process.env.LUMINA_ALLOW_PAID === "1";
const LIMIT_INDEX = args.indexOf("--limit");
const LIMIT = LIMIT_INDEX !== -1 ? parseInt(args[LIMIT_INDEX + 1], 10) || 5 : 5;

if (!DRY_RUN && (!CONFIRMED || !ALLOW_PAID)) {
  console.error(
    "HATA: Gerçek üretim için --confirm bayrağı VE LUMINA_ALLOW_PAID=1 env değişkeni gereklidir.",
  );
  process.exit(1);
}

/* ─── Şablon verilerini oku ─── */

function collectTemplateFiles(dir) {
  const results = [];
  const entries = existsSync(dir) ? readdirSync(dir, { withFileTypes: true }) : [];
  for (const entry of entries) {
    if (entry.isFile() && /\.(ts)$/i.test(entry.name)) {
      results.push(join(dir, entry.name));
    }
  }
  return results;
}

function parseTemplates() {
  // Only parse typescript files manually — doesn't need TS compiler
  const files = collectTemplateFiles(TEMPLATES_DIR);
  const templates = [];

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    // Extract template objects from the array exports
    const objRegex = /\{\s*id:\s*"([^"]+)"/g;
    let match;
    while ((match = objRegex.exec(content)) !== null) {
      const id = match[1];
      const title = content.slice(match.index).match(/title:\s*"([^"]+)"/)?.[1] ?? "";
      const bestForMatch = content.slice(match.index).match(/bestFor:\s*\[([^\]]+)\]/)?.[1];
      const bestFor = bestForMatch
        ? bestForMatch.split(",").map((s) => s.trim().replace(/["']/g, ""))
        : [];
      const hasRef = /referenceImage/.test(content.slice(match.index, match.index + 500));
      const promptMatch = content.slice(match.index).match(/prompt:\s*"([^"]+)"/)?.[1];
      const prompt = promptMatch ?? "";

      if (!hasRef) {
        templates.push({ id, title, bestFor, prompt });
      }
    }
  }
  return templates;
}

/* ─── Fixture görsel tarama ─── */

function findFixture(category) {
  if (!existsSync(FIXTURES_DIR)) return null;
  const files = readdirSync(FIXTURES_DIR);
  const match = files.find((f) => basename(f, extname(f)) === category);
  return match ? join(FIXTURES_DIR, match) : null;
}

/* ─── Dry-run modu ─── */

async function dryRun(templates) {
  console.log("\n=== KURU ÇALIŞMA (dry-run) ===\n");
  console.log(`Model: ${MODEL}`);
  console.log(`Limit: ${LIMIT}`);
  console.log(`Üretilecek şablon sayısı: ${templates.length}\n`);

  for (let i = 0; i < Math.min(templates.length, LIMIT); i++) {
    const t = templates[i];
    const fixture = t.bestFor.length > 0 ? findFixture(t.bestFor[0]) : null;
    console.log(`  [${i + 1}/${Math.min(templates.length, LIMIT)}] ${t.id}`);
    console.log(`    Başlık: ${t.title}`);
    console.log(`    Kategori: ${t.bestFor[0] ?? "(yok)"}`);
    console.log(`    Fixture: ${fixture ? basename(fixture) : "⚠ BULUNAMADI — atlanacak"}`);
    console.log(`    Çıktı: public/templates/${t.id}.webp`);
    console.log("");
  }

  const skipped = templates.filter((t) => t.bestFor.length === 0 || !findFixture(t.bestFor[0]));
  if (skipped.length > 0) {
    console.log(`⚠ Fixture bulunamadığı için atlanacak şablonlar: ${skipped.map((t) => t.id).join(", ")}`);
  }

  console.log(`\nToplam: ${templates.length} şablon, ${LIMIT} limit, ` +
    `${templates.length - skipped.length} aday`);
}

/* ─── Canlı üretim ─── */

async function liveGenerate(templates) {
  console.log("\n=== CANLI ÜRETİM ===\n");
  ensureDir(OUTPUT_DIR);

  let { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let success = 0;
  let fail = 0;
  let totalCost = 0;

  const toGenerate = templates.slice(0, LIMIT);

  for (let i = 0; i < toGenerate.length; i++) {
    const t = toGenerate[i];
    const fixture = t.bestFor.length > 0 ? findFixture(t.bestFor[0]) : null;

    if (!fixture) {
      console.log(`[${i + 1}/${toGenerate.length}] ${t.id} → ⚠ fixture yok, atlandı.`);
      fail++;
      continue;
    }

    console.log(`[${i + 1}/${toGenerate.length}] ${t.id} → üretiliyor…`);

    try {
      const imageBytes = readFileSync(fixture);
      const mimeType = extname(fixture) === ".png" ? "image/png" : "image/jpeg";
      const base64 = imageBytes.toString("base64");

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { text: `${PRESERVE_INSTRUCTION}\n\nScene: ${t.prompt}` },
              { inlineData: { mimeType, data: base64 } },
            ],
          },
        ],
        config: {
          imageConfig: {
            aspectRatio: "4:5",
            imageSize: "2K",
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      let saved = false;

      for (const part of parts) {
        if (part.inlineData?.data) {
          const resultMime = part.inlineData.mimeType ?? "image/png";
          const ext = resultMime === "image/png" ? "png" : "webp";
          const outputPath = join(OUTPUT_DIR, `${t.id}.${ext}`);
          writeFileSync(outputPath, Buffer.from(part.inlineData.data, "base64"));
          console.log(`  → kaydedildi: public/templates/${t.id}.${ext}`);
          saved = true;
          success++;
        }
      }

      if (!saved) {
        console.log(`  → ⚠ model görsel döndürmedi.`);
        fail++;
      }
    } catch (e) {
      console.log(`  → ✗ hata: ${e.message}`);
      fail++;
    }

    // Tahmini maliyet: image generation ~0.04 USD/adet
    totalCost += 0.04;

    // 2 sn bekle (rate limit nezaketi)
    if (i < toGenerate.length - 1) {
      console.log("  2 saniye bekleniyor…\n");
      await sleep(2000);
    }
  }

  console.log(`\n=== ÖZET ===`);
  console.log(`Başarılı: ${success}`);
  console.log(`Başarısız: ${fail}`);
  console.log(`Tahmini maliyet: ~$${totalCost.toFixed(2)} USD`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/* ─── Ana ─── */

async function main() {
  const templates = parseTemplates();

  if (templates.length === 0) {
    console.log("Tüm şablonların referenceImage değeri mevcut. Üretilecek şablon yok.");
    return;
  }

  console.log(`\nreferenceImage OLMAYAN şablon: ${templates.length}`);

  if (DRY_RUN) {
    await dryRun(templates);
  } else {
    await liveGenerate(templates);
  }
}

main().catch((e) => {
  console.error("Beklenmeyen hata:", e);
  process.exit(1);
});
