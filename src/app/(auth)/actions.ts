"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";
import { env } from "@/lib/env";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { safeInternalPath } from "@/lib/security/redirect";

export type AuthState = { error: string } | null;
export type ResetRequestState = { error: string } | { success: string } | null;

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

/** Şifre sıfırlama e-postası talebi — kayıtlı e-posta olup olmadığını sızdırmaz. */
export async function requestPasswordResetAction(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const neutralSuccess = {
    success:
      "Bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısını içeren bir e-posta gönderdik.",
  };

  if (!email) {
    return { error: "E-posta gereklidir." };
  }

  // Brute-force / e-posta bombalama koruması: IP+e-posta başına 15 dakikada 3 deneme.
  const ip = await getClientIp();
  const rl = checkRateLimit(`reset-request:${ip}:${email}`, 3, 15 * 60 * 1000);
  if (!rl.ok) {
    // Rate limit aşımında bile nötr mesajı döndürüyoruz — enumeration riski.
    return neutralSuccess;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.siteUrl}/auth/callback?next=${encodeURIComponent(ROUTES.resetPassword)}`,
  });
  if (error) {
    console.error("[auth/reset-request] beklenmeyen hata:", error);
  }

  // Hata olsa da olmasa da aynı nötr mesaj — kayıtlı e-posta var/yok bilgisini sızdırmaz.
  return neutralSuccess;
}

/** Recovery linkiyle gelen kullanıcının yeni şifre belirlemesi. */
export async function updatePasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 6) {
    return { error: "Parola en az 6 karakter olmalıdır." };
  }
  if (password !== confirmPassword) {
    return { error: "Parolalar eşleşmiyor." };
  }

  const supabase = await createClient();

  // Bu action yalnızca recovery linkiyle açılan (exchangeCodeForSession
  // sonrası geçici oturumlu) tarayıcıda anlamlıdır — oturum yoksa reddet.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Bağlantının süresi dolmuş. Lütfen tekrar deneyin." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("[auth/update-password] beklenmeyen hata:", error);
    return { error: "Parola güncellenemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/", "layout");
  redirect(ROUTES.login);
}

/** Çıkış. */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(ROUTES.home);
}
