import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminUserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  balance: number;
}

/**
 * Tüm kullanıcıları kredi bakiyeleriyle birlikte listeler.
 * RLS'i bypass eder (service_role) — sadece admin sayfasından çağrılmalı.
 */
export async function listUsersWithCredits(limit = 100): Promise<AdminUserRow[]> {
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!profiles || profiles.length === 0) return [];

  const { data: credits } = await admin
    .from("credits")
    .select("*")
    .in(
      "user_id",
      profiles.map((p) => p.id),
    );
  const balanceByUser = new Map((credits ?? []).map((c) => [c.user_id, c.balance]));

  return profiles.map((p) => ({
    id: p.id,
    email: p.email,
    full_name: p.full_name,
    is_admin: p.is_admin,
    created_at: p.created_at,
    balance: balanceByUser.get(p.id) ?? 0,
  }));
}

export interface AdminStats {
  userCount: number;
  totalBalance: number;
  revenueCents: number;
}

/** Panel üstündeki özet kartları için toplu istatistikler. */
export async function getAdminStats(): Promise<AdminStats> {
  const admin = createAdminClient();

  const [{ count: userCount }, { data: credits }, { data: purchases }] =
    await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("credits").select("balance"),
      admin.from("purchases").select("amount_cents").eq("status", "paid"),
    ]);

  return {
    userCount: userCount ?? 0,
    totalBalance: (credits ?? []).reduce((sum, c) => sum + c.balance, 0),
    revenueCents: (purchases ?? []).reduce((sum, p) => sum + p.amount_cents, 0),
  };
}
