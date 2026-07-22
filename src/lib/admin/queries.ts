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
