"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROUTES } from "@/lib/constants";
import { checkRateLimit } from "@/lib/security/rate-limit";

export type SettingsState = { error: string } | { success: string } | null;

/** Ad soyad — hem auth user_metadata hem profiles tablosu senkron güncellenir. */
export async function updateProfileAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const { error: authErr } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });
  if (authErr) {
    console.error("[settings/profile] auth.updateUser hatası:", authErr);
    return { error: "Ad güncellenemedi. Lütfen tekrar deneyin." };
  }

  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);
  if (profileErr) {
    console.error("[settings/profile] profiles update hatası:", profileErr);
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { success: "Ad soyad güncellendi." };
}

/** E-posta değişikliği — Supabase her iki adrese onay maili gönderir. */
export async function updateEmailAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { error: "Geçerli bir e-posta girin." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const rl = checkRateLimit(`email-change:${user.id}`, 3, 60 * 60 * 1000);
  if (!rl.ok) {
    return { error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." };
  }

  const { error } = await supabase.auth.updateUser({ email });
  if (error) {
    console.error("[settings/email] auth.updateUser hatası:", error);
    return { error: "E-posta güncellenemedi. Lütfen tekrar deneyin." };
  }

  return {
    success:
      "Onay bağlantısı hem mevcut hem yeni e-posta adresinize gönderildi. Değişiklik, yeni adresteki bağlantıyı onayladıktan sonra etkinleşir.",
  };
}

/** Şifre değiştirme — mevcut şifre ile re-auth zorunlu (Supabase'de ayrı bir doğrulama API'si yok). */
export async function updateAccountPasswordAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const currentPassword = String(formData.get("current_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (newPassword.length < 6) {
    return { error: "Yeni parola en az 6 karakter olmalıdır." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Yeni parolalar eşleşmiyor." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect(ROUTES.login);

  const rl = checkRateLimit(`pwchange:${user.id}`, 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return { error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." };
  }

  const { error: reauthErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (reauthErr) {
    return { error: "Mevcut parola hatalı." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    console.error("[settings/password] auth.updateUser hatası:", error);
    return { error: "Parola güncellenemedi. Lütfen tekrar deneyin." };
  }

  return { success: "Parola güncellendi." };
}

/** Hesap silme — id her zaman oturumdan alınır, formdan asla (IDOR koruması). */
export async function deleteAccountAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const confirmText = String(formData.get("confirm_text") ?? "");
  if (confirmText !== "SİL") {
    return { error: 'Onaylamak için kutuya "SİL" yazın.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const rl = checkRateLimit(`account-delete:${user.id}`, 3, 60 * 60 * 1000);
  if (!rl.ok) {
    return { error: "Çok fazla deneme, lütfen daha sonra tekrar deneyin." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[settings/delete-account] hata:", error);
    return { error: "Hesap silinemedi. Lütfen destek ile iletişime geçin." };
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(ROUTES.home);
}
