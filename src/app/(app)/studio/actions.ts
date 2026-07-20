"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { analyzeProduct, type ProductAnalysis } from "@/lib/gemini/analyze";
import { analyzeForCreative } from "@/lib/gemini/creative";
import { generateProductImage } from "@/lib/gemini/generate";
import {
  analyzeForSalesSet,
  REALISM_ANCHOR,
  SHOT_ASPECT_RATIOS,
  type SalesShot,
  type SalesShotType,
} from "@/lib/gemini/sales-set";
import { validateImageUpload } from "@/lib/security/image";
import { checkRateLimit } from "@/lib/security/rate-limit";
import {
  creditCostFor,
  salesSetCreditCost,
  type RenderQuality,
} from "@/lib/credits";

/** `createClient()` sonucunun tip kısayolu — Satış Seti iç yardımcısına parametre olarak geçilir. */
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const BUCKET = "product-images";

/** Kötüye kullanım sınırları (kullanıcı başına, saatlik pencere). */
const HOUR_MS = 60 * 60 * 1000;
const ANALYZE_LIMIT = 15; // kredisiz ama Vision API maliyeti var
const UPLOAD_LIMIT = 30;
const GENERATE_LIMIT = 30; // asıl fren kredi; bu sadece emniyet kemeri
const SALES_SET_LIMIT = 5; // saatlik — her istek 4 render tetikler, ayrı ve daha sıkı sınır
const CREATIVE_LIMIT = 15; // saatlik — Vision + render tek istekte, generate ile aynı mertebe

/** Kullanıcının prompt'u için üst sınır — token maliyeti kontrolü. */
const MAX_PROMPT_CHARS = 2_000;
const MAX_TITLE_CHARS = 120;

/** Nano Banana'nın desteklediği en-boy oranları. */
const ALLOWED_ASPECT_RATIOS = new Set([
  "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9",
]);

/** Desteklenen render kaliteleri — istemciden gelen değer bu listeye göre doğrulanır. */
const ALLOWED_QUALITIES = new Set<RenderQuality>(["2K", "4K"]);

function resolveQuality(input?: string): RenderQuality {
  return ALLOWED_QUALITIES.has(input as RenderQuality)
    ? (input as RenderQuality)
    : "2K";
}

// ─────────────────────────────────────────────────────────────
// AŞAMA 1 — Analiz (kredi düşmez)
// ─────────────────────────────────────────────────────────────
export type AnalyzeResult =
  | {
      ok: true;
      analysis: ProductAnalysis;
      sourcePath: string;
      sourceUrl: string;
      mimeType: string;
    }
  | { ok: false; error: string };

export async function analyzeProductAction(
  formData: FormData,
): Promise<AnalyzeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  const rl = checkRateLimit(`analyze:${user.id}`, ANALYZE_LIMIT, HOUR_MS);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Çok sık analiz istediniz. Lütfen ${Math.ceil(rl.retryAfterSec / 60)} dakika sonra tekrar deneyin.`,
    };
  }

  const image = await validateImageUpload(formData.get("image"));
  if (!image.ok) return { ok: false, error: image.error };
  const category = String(formData.get("category") ?? "").slice(0, 40);

  // Kaynak görseli depola (sonraki render aşamasında kullanılacak).
  const sourcePath = `${user.id}/sources/${crypto.randomUUID()}.${image.ext}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(sourcePath, image.bytes, {
      contentType: image.mimeType,
      upsert: false,
    });
  if (upErr) {
    console.error("[studio/analyze] storage upload hatası:", upErr);
    return { ok: false, error: "Görsel yüklenemedi, lütfen tekrar deneyin." };
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(sourcePath);

  try {
    const analysis = await analyzeProduct(
      image.bytes.toString("base64"),
      image.mimeType,
      category || undefined,
    );
    return {
      ok: true,
      analysis,
      sourcePath,
      sourceUrl: publicUrl,
      mimeType: image.mimeType,
    };
  } catch (e) {
    // analyzeProduct kullanıcıya uygun (sanitize edilmiş) mesaj fırlatır.
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Analiz başarısız oldu.",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Hafif yükleme — Hazır Stüdyo akışı için (analiz yok, kredi yok)
// ─────────────────────────────────────────────────────────────
export type UploadResult =
  | { ok: true; sourcePath: string; sourceUrl: string; mimeType: string }
  | { ok: false; error: string };

export async function uploadSourceAction(
  formData: FormData,
): Promise<UploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  const rl = checkRateLimit(`upload:${user.id}`, UPLOAD_LIMIT, HOUR_MS);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Çok sık yükleme yaptınız. Lütfen ${Math.ceil(rl.retryAfterSec / 60)} dakika sonra tekrar deneyin.`,
    };
  }

  const image = await validateImageUpload(formData.get("image"));
  if (!image.ok) return { ok: false, error: image.error };

  const sourcePath = `${user.id}/sources/${crypto.randomUUID()}.${image.ext}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(sourcePath, image.bytes, {
      contentType: image.mimeType,
      upsert: false,
    });
  if (upErr) {
    console.error("[studio/upload] storage upload hatası:", upErr);
    return { ok: false, error: "Görsel yüklenemedi, lütfen tekrar deneyin." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(sourcePath);
  return { ok: true, sourcePath, sourceUrl: publicUrl, mimeType: image.mimeType };
}

// ─────────────────────────────────────────────────────────────
// AŞAMA 2 — Render (başarıda 1 kredi düşer)
// ─────────────────────────────────────────────────────────────
export type GenerateResult =
  | { ok: true; generationId: string; resultUrl: string; balance: number }
  | { ok: false; error: string; needCredits?: boolean };

export async function generateImageAction(input: {
  sourcePath: string;
  mimeType: string;
  prompt: string;
  conceptTitle: string;
  category?: string;
  templateId?: string;
  aspectRatio?: string;
  quality?: string;
}): Promise<GenerateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  const rl = checkRateLimit(`generate:${user.id}`, GENERATE_LIMIT, HOUR_MS);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Çok sık üretim istediniz. Lütfen ${Math.ceil(rl.retryAfterSec / 60)} dakika sonra tekrar deneyin.`,
    };
  }

  // Girdi doğrulama — istemciden gelen hiçbir alana güvenilmez.
  const prompt = input.prompt?.trim() ?? "";
  if (!prompt) {
    return { ok: false, error: "Geçerli bir konsept/prompt gerekli." };
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return {
      ok: false,
      error: `Prompt en fazla ${MAX_PROMPT_CHARS} karakter olabilir.`,
    };
  }
  // Kaynak görsel yalnızca kullanıcının kendi klasöründen okunabilir.
  if (
    !input.sourcePath.startsWith(`${user.id}/sources/`) ||
    input.sourcePath.includes("..")
  ) {
    return { ok: false, error: "Geçersiz kaynak görsel." };
  }
  const aspectRatio =
    input.aspectRatio && ALLOWED_ASPECT_RATIOS.has(input.aspectRatio)
      ? input.aspectRatio
      : "4:5";
  const conceptTitle = input.conceptTitle.slice(0, MAX_TITLE_CHARS);
  const quality = resolveQuality(input.quality);
  const creditCost = creditCostFor(quality);

  // 1) Kredi ön kontrolü — pahalı API çağrısından önce.
  const { data: credits } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!credits || credits.balance < creditCost) {
    return {
      ok: false,
      error: "Krediniz yetersiz. Devam etmek için paket satın alın.",
      needCredits: true,
    };
  }

  // 2) Üretim kaydını 'processing' olarak aç.
  const { data: gen, error: genErr } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      status: "processing",
      source_image_path: input.sourcePath,
      category: input.category?.slice(0, 40) ?? null,
      concept_title: conceptTitle,
      prompt,
      template_id: input.templateId ?? null,
      model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview",
      credits_spent: creditCost,
    })
    .select("id")
    .single();
  if (genErr || !gen) {
    console.error("[studio/generate] üretim kaydı hatası:", genErr);
    return { ok: false, error: "Üretim kaydı oluşturulamadı." };
  }

  try {
    // 3) Kaynak görseli depodan indir.
    const { data: blob, error: dlErr } = await supabase.storage
      .from(BUCKET)
      .download(input.sourcePath);
    if (dlErr || !blob) throw new Error("Kaynak görsel okunamadı.");
    const srcBase64 = Buffer.from(await blob.arrayBuffer()).toString("base64");

    // 4) Nano Banana 2 ile render.
    const image = await generateProductImage(
      srcBase64,
      input.mimeType,
      prompt,
      aspectRatio,
      quality,
    );

    // 5) Sonucu depola.
    const resultPath = `${user.id}/results/${gen.id}.png`;
    const resultBytes = Buffer.from(image.base64, "base64");
    const { error: rUpErr } = await supabase.storage
      .from(BUCKET)
      .upload(resultPath, resultBytes, {
        contentType: image.mimeType,
        upsert: true,
      });
    if (rUpErr) {
      console.error("[studio/generate] sonuç upload hatası:", rUpErr);
      throw new Error("Sonuç görseli kaydedilemedi, lütfen tekrar deneyin.");
    }
    const {
      data: { publicUrl: resultUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(resultPath);

    // 6) Krediyi atomik düş (yalnızca başarılı render sonrası).
    const { data: newBalance, error: spendErr } = await supabase.rpc(
      "spend_credits",
      {
        p_user_id: user.id,
        p_amount: creditCost,
        p_reason: "generation",
        p_generation_id: gen.id,
      },
    );
    if (spendErr) {
      console.error("[studio/generate] spend_credits hatası:", spendErr);
      throw new Error("Kredi düşülemedi.");
    }

    // 7) Üretimi tamamlandı olarak işaretle.
    await supabase
      .from("generations")
      .update({
        status: "completed",
        result_image_path: resultPath,
        result_image_url: resultUrl,
        completed_at: new Date().toISOString(),
      })
      .eq("id", gen.id);

    revalidatePath("/generations");
    revalidatePath("/dashboard");

    return {
      ok: true,
      generationId: gen.id,
      resultUrl,
      balance: (newBalance as number) ?? credits.balance - creditCost,
    };
  } catch (e) {
    // Başarısızlıkta kredi DÜŞMEZ; kaydı 'failed' yap.
    const message = e instanceof Error ? e.message : "Üretim başarısız oldu.";
    await supabase
      .from("generations")
      .update({ status: "failed", error: message })
      .eq("id", gen.id);
    return { ok: false, error: message };
  }
}

// ─────────────────────────────────────────────────────────────
// C10 — SATIŞ SETİ: tek üründen 4 karelik e-ticaret listeleme seti
// ─────────────────────────────────────────────────────────────
export type SalesSetShotResult = {
  type: SalesShotType;
  title: string;
  status: "completed" | "failed";
  resultUrl?: string;
  generationId?: string;
  error?: string;
};

export type SalesSetResult =
  | {
      ok: true;
      setId: string;
      results: SalesSetShotResult[];
      balance: number;
      spentCredits: number;
    }
  | { ok: false; error: string; needCredits?: boolean };

/**
 * Tek bir kareyi render eder: generations satırı açar → generateProductImage çağırır →
 * sonucu storage'a yükler → yalnızca BU kare başarılıysa spend_credits çağırır → completed
 * yapar. Hata durumunda satırı 'failed' işaretler, kredi düşmez; hiçbir zaman reddetmez
 * (throw etmez) — çağıran taraf Promise.allSettled ile diğer karelerden bağımsız sonuç alır.
 */
async function renderSalesSetShot(params: {
  supabase: SupabaseServerClient;
  userId: string;
  setId: string;
  shot: SalesShot;
  srcBase64: string;
  mimeType: string;
  category?: string;
  quality: RenderQuality;
}): Promise<SalesSetShotResult> {
  const { supabase, userId, setId, shot, srcBase64, mimeType, category, quality } =
    params;
  const creditCost = creditCostFor(quality);
  const aspectRatio = SHOT_ASPECT_RATIOS[shot.type];
  const finalPrompt = `${shot.prompt}\n\n${REALISM_ANCHOR}`;

  // 1) Üretim kaydını 'processing' olarak aç.
  const { data: gen, error: genErr } = await supabase
    .from("generations")
    .insert({
      user_id: userId,
      status: "processing",
      category: category?.slice(0, 40) ?? null,
      concept_title: shot.title.slice(0, MAX_TITLE_CHARS),
      prompt: finalPrompt,
      model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview",
      credits_spent: creditCost,
      set_id: setId,
    })
    .select("id")
    .single();
  if (genErr || !gen) {
    console.error("[studio/sales-set] üretim kaydı hatası:", genErr);
    return {
      type: shot.type,
      title: shot.title,
      status: "failed",
      error: "Üretim kaydı oluşturulamadı.",
    };
  }

  try {
    // 2) Nano Banana 2 ile render.
    const image = await generateProductImage(
      srcBase64,
      mimeType,
      finalPrompt,
      aspectRatio,
      quality,
    );

    // 3) Sonucu depola.
    const resultPath = `${userId}/results/${gen.id}.png`;
    const resultBytes = Buffer.from(image.base64, "base64");
    const { error: rUpErr } = await supabase.storage
      .from(BUCKET)
      .upload(resultPath, resultBytes, {
        contentType: image.mimeType,
        upsert: true,
      });
    if (rUpErr) {
      console.error("[studio/sales-set] sonuç upload hatası:", rUpErr);
      throw new Error("Sonuç görseli kaydedilemedi, lütfen tekrar deneyin.");
    }
    const {
      data: { publicUrl: resultUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(resultPath);

    // 4) Krediyi atomik düş — YALNIZCA bu kare başarılıysa, görsel başına.
    const { error: spendErr } = await supabase.rpc("spend_credits", {
      p_user_id: userId,
      p_amount: creditCost,
      p_reason: "generation",
      p_generation_id: gen.id,
    });
    if (spendErr) {
      console.error("[studio/sales-set] spend_credits hatası:", spendErr);
      throw new Error("Kredi düşülemedi.");
    }

    // 5) Üretimi tamamlandı olarak işaretle.
    await supabase
      .from("generations")
      .update({
        status: "completed",
        result_image_path: resultPath,
        result_image_url: resultUrl,
        completed_at: new Date().toISOString(),
      })
      .eq("id", gen.id);

    return {
      type: shot.type,
      title: shot.title,
      status: "completed",
      resultUrl,
      generationId: gen.id,
    };
  } catch (e) {
    // Başarısızlıkta kredi DÜŞMEZ; kaydı 'failed' yap. Diğer kareler etkilenmez.
    const message = e instanceof Error ? e.message : "Üretim başarısız oldu.";
    await supabase
      .from("generations")
      .update({ status: "failed", error: message })
      .eq("id", gen.id);
    return {
      type: shot.type,
      title: shot.title,
      status: "failed",
      generationId: gen.id,
      error: message,
    };
  }
}

export async function generateSalesSetAction(input: {
  sourcePath: string;
  mimeType: string;
  category?: string;
  quality?: string;
}): Promise<SalesSetResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  const rl = checkRateLimit(`salesset:${user.id}`, SALES_SET_LIMIT, HOUR_MS);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Çok sık satış seti istediniz. Lütfen ${Math.ceil(rl.retryAfterSec / 60)} dakika sonra tekrar deneyin.`,
    };
  }

  // Kaynak görsel yalnızca kullanıcının kendi klasöründen okunabilir.
  if (
    !input.sourcePath.startsWith(`${user.id}/sources/`) ||
    input.sourcePath.includes("..")
  ) {
    return { ok: false, error: "Geçersiz kaynak görsel." };
  }
  const quality = resolveQuality(input.quality);
  const totalCost = salesSetCreditCost(quality);

  // 1) Kredi ön kontrolü — 4 kare için toplam maliyet, pahalı API çağrısından önce.
  const { data: credits } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!credits || credits.balance < totalCost) {
    return {
      ok: false,
      error: "Krediniz yetersiz. Devam etmek için paket satın alın.",
      needCredits: true,
    };
  }

  // 2) Kaynak görseli depodan indir.
  const { data: blob, error: dlErr } = await supabase.storage
    .from(BUCKET)
    .download(input.sourcePath);
  if (dlErr || !blob) {
    return { ok: false, error: "Kaynak görsel okunamadı." };
  }
  const srcBase64 = Buffer.from(await blob.arrayBuffer()).toString("base64");

  // 3) Vision analizi — 4 kare için promptlar (kredi düşmez).
  let shots: SalesShot[];
  try {
    const analysis = await analyzeForSalesSet(
      srcBase64,
      input.mimeType,
      input.category,
    );
    shots = analysis.shots;
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Analiz başarısız oldu.",
    };
  }

  const setId = crypto.randomUUID();

  // 4) 4 kareyi paralel işle — biri başarısız olsa da diğerleri etkilenmez.
  const settled = await Promise.allSettled(
    shots.map((shot) =>
      renderSalesSetShot({
        supabase,
        userId: user.id,
        setId,
        shot,
        srcBase64,
        mimeType: input.mimeType,
        category: input.category,
        quality,
      }),
    ),
  );

  const results: SalesSetShotResult[] = settled.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    // renderSalesSetShot normalde reddetmez; yine de savunmacı bir yedek.
    const shot = shots[i];
    return {
      type: shot.type,
      title: shot.title,
      status: "failed",
      error:
        r.reason instanceof Error ? r.reason.message : "Üretim başarısız oldu.",
    };
  });

  const successCount = results.filter((r) => r.status === "completed").length;
  if (successCount === 0) {
    return { ok: false, error: "Hiçbir kare üretilemedi, lütfen tekrar deneyin." };
  }

  const { data: freshCredits } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  revalidatePath("/generations");
  revalidatePath("/dashboard");

  return {
    ok: true,
    setId,
    results,
    balance: freshCredits?.balance ?? credits.balance,
    spentCredits: successCount * creditCostFor(quality),
  };
}

// ─────────────────────────────────────────────────────────────
// KREATİF ÜRET — tek tık: Vision cüretkar TEK sahne tasarlar,
// doğrudan render edilir (konsept seçim adımı yok).
// ─────────────────────────────────────────────────────────────
export type CreativeResult =
  | {
      ok: true;
      generationId: string;
      resultUrl: string;
      balance: number;
      title: string;
    }
  | { ok: false; error: string; needCredits?: boolean };

export async function generateCreativeAction(input: {
  sourcePath: string;
  mimeType: string;
  category?: string;
  aspectRatio?: string;
  quality?: string;
}): Promise<CreativeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum bulunamadı." };

  const rl = checkRateLimit(`creative:${user.id}`, CREATIVE_LIMIT, HOUR_MS);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Çok sık kreatif üretim istediniz. Lütfen ${Math.ceil(rl.retryAfterSec / 60)} dakika sonra tekrar deneyin.`,
    };
  }

  // Kaynak görsel yalnızca kullanıcının kendi klasöründen okunabilir.
  if (
    !input.sourcePath.startsWith(`${user.id}/sources/`) ||
    input.sourcePath.includes("..")
  ) {
    return { ok: false, error: "Geçersiz kaynak görsel." };
  }
  const aspectRatio =
    input.aspectRatio && ALLOWED_ASPECT_RATIOS.has(input.aspectRatio)
      ? input.aspectRatio
      : "4:5";
  const quality = resolveQuality(input.quality);
  const creditCost = creditCostFor(quality);

  // 1) Kredi ön kontrolü — pahalı API çağrısından önce.
  const { data: credits } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!credits || credits.balance < creditCost) {
    return {
      ok: false,
      error: "Krediniz yetersiz. Devam etmek için paket satın alın.",
      needCredits: true,
    };
  }

  // 2) Kaynak görseli depodan indir.
  const { data: blob, error: dlErr } = await supabase.storage
    .from(BUCKET)
    .download(input.sourcePath);
  if (dlErr || !blob) {
    return { ok: false, error: "Kaynak görsel okunamadı." };
  }
  const srcBase64 = Buffer.from(await blob.arrayBuffer()).toString("base64");

  // 3) Vision — cüretkar tek sahne tasarımı (kredi düşmez).
  let concept: { title: string; prompt: string };
  try {
    concept = await analyzeForCreative(srcBase64, input.mimeType, input.category);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Analiz başarısız oldu.",
    };
  }
  const conceptTitle = concept.title.slice(0, MAX_TITLE_CHARS);
  const prompt = concept.prompt.slice(0, MAX_PROMPT_CHARS);

  // 4) Üretim kaydını 'processing' olarak aç.
  const { data: gen, error: genErr } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      status: "processing",
      source_image_path: input.sourcePath,
      category: input.category?.slice(0, 40) ?? null,
      concept_title: conceptTitle,
      prompt,
      model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview",
      credits_spent: creditCost,
    })
    .select("id")
    .single();
  if (genErr || !gen) {
    console.error("[studio/creative] üretim kaydı hatası:", genErr);
    return { ok: false, error: "Üretim kaydı oluşturulamadı." };
  }

  try {
    // 5) Nano Banana 2 ile render.
    const image = await generateProductImage(
      srcBase64,
      input.mimeType,
      prompt,
      aspectRatio,
      quality,
    );

    // 6) Sonucu depola.
    const resultPath = `${user.id}/results/${gen.id}.png`;
    const resultBytes = Buffer.from(image.base64, "base64");
    const { error: rUpErr } = await supabase.storage
      .from(BUCKET)
      .upload(resultPath, resultBytes, {
        contentType: image.mimeType,
        upsert: true,
      });
    if (rUpErr) {
      console.error("[studio/creative] sonuç upload hatası:", rUpErr);
      throw new Error("Sonuç görseli kaydedilemedi, lütfen tekrar deneyin.");
    }
    const {
      data: { publicUrl: resultUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(resultPath);

    // 7) Krediyi atomik düş (yalnızca başarılı render sonrası).
    const { data: newBalance, error: spendErr } = await supabase.rpc(
      "spend_credits",
      {
        p_user_id: user.id,
        p_amount: creditCost,
        p_reason: "generation",
        p_generation_id: gen.id,
      },
    );
    if (spendErr) {
      console.error("[studio/creative] spend_credits hatası:", spendErr);
      throw new Error("Kredi düşülemedi.");
    }

    // 8) Üretimi tamamlandı olarak işaretle.
    await supabase
      .from("generations")
      .update({
        status: "completed",
        result_image_path: resultPath,
        result_image_url: resultUrl,
        completed_at: new Date().toISOString(),
      })
      .eq("id", gen.id);

    revalidatePath("/generations");
    revalidatePath("/dashboard");

    return {
      ok: true,
      generationId: gen.id,
      resultUrl,
      balance: (newBalance as number) ?? credits.balance - creditCost,
      title: conceptTitle,
    };
  } catch (e) {
    // Başarısızlıkta kredi DÜŞMEZ; kaydı 'failed' yap.
    const message = e instanceof Error ? e.message : "Üretim başarısız oldu.";
    await supabase
      .from("generations")
      .update({ status: "failed", error: message })
      .eq("id", gen.id);
    return { ok: false, error: message };
  }
}
