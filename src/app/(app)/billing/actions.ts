"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/security/rate-limit";

/**
 * MOCK ÖDEME — Stripe/Iyzico entegrasyonu için yer tutucu.
 * Gerçek entegrasyonda: checkout session oluştur → webhook'ta krediyi yükle.
 * Şimdilik ödeme "başarılı" sayılır ve kredi anında yüklenir.
 */
export async function purchasePackageAction(
  formData: FormData,
): Promise<void> {
  const packageId = String(formData.get("package_id") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum bulunamadı");

  const rl = checkRateLimit(`purchase:${user.id}`, 10, 60 * 60 * 1000);
  if (!rl.ok) throw new Error("Çok fazla satın alma denemesi, lütfen bekleyin.");

  // Paketi doğrula (fiyat/kredi sunucudan okunur, istemciye güvenilmez)
  const { data: pkg } = await supabase
    .from("packages")
    .select("*")
    .eq("id", packageId)
    .eq("is_active", true)
    .maybeSingle();
  if (!pkg) throw new Error("Paket bulunamadı");

  const admin = createAdminClient();

  // 1) Satın alma kaydı (mock: anında 'paid')
  const { data: purchase, error: purchaseErr } = await admin
    .from("purchases")
    .insert({
      user_id: user.id,
      package_id: pkg.id,
      credits: pkg.credits,
      amount_cents: pkg.price_cents,
      currency: pkg.currency,
      status: "paid",
      provider: "mock",
      provider_ref: `mock_${Date.now()}`,
    })
    .select("id")
    .single();
  if (purchaseErr) {
    console.error("[billing] purchase insert hatası:", purchaseErr);
    throw new Error("Satın alma işlemi tamamlanamadı.");
  }

  // 2) Krediyi atomik olarak yükle
  const { error: grantErr } = await admin.rpc("grant_credits", {
    p_user_id: user.id,
    p_amount: pkg.credits,
    p_reason: `purchase:${purchase.id}`,
  });
  if (grantErr) {
    console.error("[billing] grant_credits hatası:", grantErr);
    throw new Error("Kredi yüklenemedi, destek ile iletişime geçin.");
  }

  revalidatePath("/billing");
  revalidatePath("/dashboard");
}
