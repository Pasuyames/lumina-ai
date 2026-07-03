"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { analyzeProduct, type ProductAnalysis } from "@/lib/gemini/analyze";
import { generateProductImage } from "@/lib/gemini/generate";
import { CREDITS_PER_GENERATION } from "@/lib/constants";
import { validateImageUpload } from "@/lib/security/image";
import { checkRateLimit } from "@/lib/security/rate-limit";

const BUCKET = "product-images";

/** Kötüye kullanım sınırları (kullanıcı başına, saatlik pencere). */
const HOUR_MS = 60 * 60 * 1000;
const ANALYZE_LIMIT = 15; // kredisiz ama Vision API maliyeti var
const UPLOAD_LIMIT = 30;
const GENERATE_LIMIT = 30; // asıl fren kredi; bu sadece emniyet kemeri

/** Kullanıcının prompt'u için üst sınır — token maliyeti kontrolü. */
const MAX_PROMPT_CHARS = 2_000;
const MAX_TITLE_CHARS = 120;

/** Nano Banana'nın desteklediği en-boy oranları. */
const ALLOWED_ASPECT_RATIOS = new Set([
  "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9",
]);

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

  // 1) Kredi ön kontrolü — pahalı API çağrısından önce.
  const { data: credits } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!credits || credits.balance < CREDITS_PER_GENERATION) {
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
      credits_spent: CREDITS_PER_GENERATION,
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
        p_amount: CREDITS_PER_GENERATION,
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
      balance: (newBalance as number) ?? credits.balance - 1,
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
