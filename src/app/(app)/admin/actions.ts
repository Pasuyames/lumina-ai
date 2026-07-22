"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/queries";
import { ROUTES } from "@/lib/constants";

export type AdminState = { error: string } | { success: string } | null;

/**
 * Layout guard tek başına yeterli değil — server action'lar layout render
 * zincirinden bağımsız tetiklenebilir, bu yüzden her action içinde de
 * is_admin tekrar doğrulanır.
 */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const profile = await getProfile(user.id);
  if (!profile?.is_admin) redirect(ROUTES.dashboard);

  return user;
}

/** Bir kullanıcının kredisini manuel ekler veya düşer — mevcut grant_credits/spend_credits RPC'lerini reuse eder. */
export async function adjustCreditsAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const adminUser = await requireAdmin();

  const targetUserId = String(formData.get("user_id") ?? "");
  const direction = String(formData.get("direction") ?? "grant");
  const amount = Number(formData.get("amount") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 200);

  if (!targetUserId || !Number.isFinite(amount) || amount <= 0) {
    return { error: "Geçerli bir miktar girin (pozitif tam sayı)." };
  }
  if (!reason) {
    return { error: "Gerekçe girilmesi zorunludur." };
  }

  const admin = createAdminClient();
  const { error } =
    direction === "spend"
      ? await admin.rpc("spend_credits", {
          p_user_id: targetUserId,
          p_amount: amount,
          p_reason: `admin_deduct:${adminUser.id}:${reason}`,
          p_generation_id: null,
        })
      : await admin.rpc("grant_credits", {
          p_user_id: targetUserId,
          p_amount: amount,
          p_reason: `admin_grant:${adminUser.id}:${reason}`,
        });

  if (error) {
    console.error("[admin/adjust-credits] hata:", error);
    return {
      error:
        direction === "spend"
          ? "Kredi düşülemedi (yetersiz bakiye olabilir)."
          : "Kredi eklenemedi.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);
  return { success: "Kredi bakiyesi güncellendi." };
}
