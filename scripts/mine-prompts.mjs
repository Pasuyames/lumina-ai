/**
 * mine-prompts.mjs
 *
 * İki açık kaynak prompt reposundan e-ticaret/ürün fotoğrafçılığı ile ilgili
 * prompt bloklarını tarar ve data/mined-prompts.json'a yazar.
 *
 * Kullanım: node scripts/mine-prompts.mjs
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TMP_DIR = join(ROOT, "tmp");
const OUTPUT_FILE = join(ROOT, "data", "mined-prompts.json");

const REPOS = [
  {
    dir: "awesome-nano-banana-pro-prompts",
    url: "https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts",
    license: "CC BY 4.0",
  },
  {
    dir: "awesome-nanobanana-pro",
    url: "https://github.com/ZeroLu/awesome-nanobanana-pro",
    license: "CC BY 4.0",
  },
];

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function cloneRepo(dir, url) {
  const target = join(TMP_DIR, dir);
  if (existsSync(target)) {
    console.log(`[skip] ${dir} zaten var, atlanıyor.`);
    return;
  }
  console.log(`[clone] ${url} → tmp/${dir}`);
  execSync(`git clone --depth 1 ${url} "${target}"`, {
    stdio: "inherit",
    cwd: TMP_DIR,
  });
}

function collectMarkdownFiles(dir) {
  const results = [];
  function walk(current) {
    const entries = existsSync(current) ? readdirSync(current, { withFileTypes: true }) : [];
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== ".git") walk(full);
      } else if (entry.isFile() && /\.(md|markdown|txt)$/i.test(entry.name)) {
        results.push(full);
      }
    }
  }
  walk(dir);
  return results;
}

const KEYWORDS = [
  "product",
  "e-commerce",
  "ecommerce",
  "jewelry",
  "watch",
  "bag",
  "perfume",
  "cosmetic",
  "luxury",
  "studio photography",
  "packshot",
  "商品",
];

function matchesKeywords(text) {
  const lower = text.toLowerCase();
  return KEYWORDS.some((kw) => lower.includes(kw));
}

function extractPrompts(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const prompts = [];

  // Match fenced code blocks (```...```)
  const blockRegex = /```[\s\S]*?```/g;
  let match;
  while ((match = blockRegex.exec(content)) !== null) {
    const block = match[0];
    if (matchesKeywords(block)) {
      prompts.push(block.replace(/```/g, "").trim());
    }
  }

  // Match inline prompt blocks (lines starting with "- " or numbered lists containing prompt keywords)
  const lines = content.split("\n");
  let currentPrompt = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[-*\d+.]\s+/.test(trimmed) && matchesKeywords(trimmed)) {
      if (currentPrompt) prompts.push(currentPrompt);
      currentPrompt = trimmed;
    } else if (currentPrompt && trimmed && !trimmed.startsWith("#")) {
      currentPrompt += " " + trimmed;
    } else if (currentPrompt) {
      prompts.push(currentPrompt);
      currentPrompt = null;
    }
  }
  if (currentPrompt) prompts.push(currentPrompt);

  return prompts;
}

function extractTitle(filePath, content) {
  const titleMatch = content.match(/^#\s+(.+)/m);
  if (titleMatch) return titleMatch[1].trim();
  return filePath.split(/[/\\]/).pop().replace(/\.(md|markdown|txt)$/i, "");
}

function main() {
  ensureDir(TMP_DIR);
  ensureDir(dirname(OUTPUT_FILE));

  // Clone repos
  for (const repo of REPOS) {
    cloneRepo(repo.dir, repo.url);
  }

  // Collect and parse prompts
  const mined = [];

  for (const repo of REPOS) {
    const repoDir = join(TMP_DIR, repo.dir);
    const files = collectMarkdownFiles(repoDir);
    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      const title = extractTitle(file, content);
      const sourcePath = file.replace(repoDir, "").replace(/\\/g, "/");
      const prompts = extractPrompts(file);
      for (const prompt of prompts) {
        mined.push({
          source: `${repo.dir}${sourcePath}`,
          title,
          prompt,
        });
      }
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(mined, null, 2), "utf-8");
  console.log(`\n✓ ${mined.length} prompt mined → data/mined-prompts.json`);
}

main();
