"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { safeInternalPath } from "@/lib/security/redirect";

export type AuthState = { error: string } | null;

/** E-posta + parola ile giriş. */
export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeInternalPath(String(formData.get("next") ?? ROUTES.dashboard));

  if (!email || !password) {
    return { error: "E-posta ve parola gereklidir." };
  }

  // Brute-force koruması: IP+e-posta başına 15 dakikada 5 deneme.
  const ip = await getClientIp();
  const rl = checkRateLimit(`signin:${ip}:${email}`, 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return {
      error: `Çok fazla başarısız deneme. Lütfen ${Math.ceil(rl.retryAfterSec / 60)} dakika sonra tekrar deneyin.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // 400 = gerçekten yanlış kimlik bilgisi; diğerleri (ağ, sunucu kapalı vb.)
    // kullanıcının parolasıyla ilgili değildir — yanıltıcı mesaj gösterme.
    if (error.status === 400) {
      return { error: "Giriş başarısız: e-posta veya parola hatalı." };
    }
    console.error("[auth/signin] beklenmeyen hata:", error);
    return {
      error:
        "Sunucuya şu an ulaşılamıyor. Lütfen biraz sonra tekrar deneyin.",
    };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

/** Yeni kayıt — trigger otomatik 3 ücretsiz kredi tanımlar. */
export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 6) {
    return { error: "Geçerli bir e-posta ve en az 6 karakterli parola girin." };
  }

  // Toplu sahte kayıt koruması: IP başına saatte 5 kayıt.
  const ip = await getClientIp();
  const rl = checkRateLimit(`signup:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return {
      error: "Çok fazla kayıt denemesi. Lütfen daha sonra tekrar deneyin.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { error: `Kayıt başarısız: ${error.message}` };
  }

  revalidatePath("/", "layout");
  redirect(ROUTES.dashboard);
}

/** Çıkış. */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(ROUTES.home);
}
