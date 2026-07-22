import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GenerationStatus, PurchaseStatus } from "@/lib/supabase/types";

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
 * RLS'i bypass eder (service_role) — sadece admin sayfalarından çağrılmalı.
 */
export async function listUsersWithCredits(
  limit = 200,
  search?: string,
): Promise<AdminUserRow[]> {
  const admin = createAdminClient();

  let query = admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }
  const { data: profiles } = await query;
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
  newUsersThisWeek: number;
  totalBalance: number;
  revenueCents: number;
  generationCount: number;
  completedCount: number;
  failedCount: number;
}

/** Genel Bakış sayfasının özet kartları için toplu istatistikler. */
export async function getAdminStats(): Promise<AdminStats> {
  const admin = createAdminClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: userCount },
    { count: newUsersThisWeek },
    { data: credits },
    { data: purchases },
    { count: generationCount },
    { count: completedCount },
    { count: failedCount },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    admin.from("credits").select("balance"),
    admin.from("purchases").select("amount_cents").eq("status", "paid"),
    admin.from("generations").select("*", { count: "exact", head: true }),
    admin
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
    admin
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed"),
  ]);

  return {
    userCount: userCount ?? 0,
    newUsersThisWeek: newUsersThisWeek ?? 0,
    totalBalance: (credits ?? []).reduce((sum, c) => sum + c.balance, 0),
    revenueCents: (purchases ?? []).reduce((sum, p) => sum + p.amount_cents, 0),
    generationCount: generationCount ?? 0,
    completedCount: completedCount ?? 0,
    failedCount: failedCount ?? 0,
  };
}

export interface AdminGenerationRow {
  id: string;
  user_email: string | null;
  status: GenerationStatus;
  concept_title: string | null;
  result_image_url: string | null;
  credits_spent: number;
  created_at: string;
}

/** Tüm kullanıcılardaki üretimler — en yeni önce, opsiyonel durum filtresi. */
export async function listAllGenerations(
  limit = 50,
  status?: GenerationStatus,
): Promise<AdminGenerationRow[]> {
  const admin = createAdminClient();

  let query = admin
    .from("generations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (status) query = query.eq("status", status);
  const { data: generations } = await query;
  if (!generations || generations.length === 0) return [];

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email")
    .in(
      "id",
      Array.from(new Set(generations.map((g) => g.user_id))),
    );
  const emailByUser = new Map((profiles ?? []).map((p) => [p.id, p.email]));

  return generations.map((g) => ({
    id: g.id,
    user_email: emailByUser.get(g.user_id) ?? null,
    status: g.status,
    concept_title: g.concept_title,
    result_image_url: g.result_image_url,
    credits_spent: g.credits_spent,
    created_at: g.created_at,
  }));
}

export interface AdminPurchaseRow {
  id: string;
  user_email: string | null;
  package_name: string | null;
  credits: number;
  amount_cents: number;
  currency: string;
  status: PurchaseStatus;
  provider: string | null;
  created_at: string;
}

/** Tüm satın almalar — en yeni önce. */
export async function listAllPurchases(limit = 50): Promise<AdminPurchaseRow[]> {
  const admin = createAdminClient();

  const { data: purchases } = await admin
    .from("purchases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!purchases || purchases.length === 0) return [];

  const [{ data: profiles }, { data: packages }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, email")
      .in("id", Array.from(new Set(purchases.map((p) => p.user_id)))),
    admin
      .from("packages")
      .select("id, name")
      .in(
        "id",
        Array.from(
          new Set(purchases.map((p) => p.package_id).filter((id): id is string => !!id)),
        ),
      ),
  ]);
  const emailByUser = new Map((profiles ?? []).map((p) => [p.id, p.email]));
  const nameByPackage = new Map((packages ?? []).map((pk) => [pk.id, pk.name]));

  return purchases.map((p) => ({
    id: p.id,
    user_email: emailByUser.get(p.user_id) ?? null,
    package_name: p.package_id ? (nameByPackage.get(p.package_id) ?? null) : null,
    credits: p.credits,
    amount_cents: p.amount_cents,
    currency: p.currency,
    status: p.status,
    provider: p.provider,
    created_at: p.created_at,
  }));
}

export interface AdminUserDetail {
  profile: {
    id: string;
    email: string | null;
    full_name: string | null;
    is_admin: boolean;
    created_at: string;
  };
  balance: number;
  totalEarned: number;
  totalSpent: number;
  generations: AdminGenerationRow[];
  purchases: AdminPurchaseRow[];
  transactions: {
    id: string;
    amount: number;
    reason: string;
    created_at: string;
  }[];
}

/** Tek bir kullanıcının tüm geçmişi — kullanıcı detay sayfası için. */
export async function getUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return null;

  const [{ data: credits }, { data: generations }, { data: purchases }, { data: transactions }] =
    await Promise.all([
      admin.from("credits").select("*").eq("user_id", userId).maybeSingle(),
      admin
        .from("generations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      admin
        .from("purchases")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      admin
        .from("credit_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

  const packageIds = Array.from(
    new Set((purchases ?? []).map((p) => p.package_id).filter((id): id is string => !!id)),
  );
  const { data: packages } = packageIds.length
    ? await admin.from("packages").select("id, name").in("id", packageIds)
    : { data: [] as { id: string; name: string }[] };
  const nameByPackage = new Map((packages ?? []).map((pk) => [pk.id, pk.name]));

  return {
    profile: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      is_admin: profile.is_admin,
      created_at: profile.created_at,
    },
    balance: credits?.balance ?? 0,
    totalEarned: credits?.total_earned ?? 0,
    totalSpent: credits?.total_spent ?? 0,
    generations: (generations ?? []).map((g) => ({
      id: g.id,
      user_email: profile.email,
      status: g.status,
      concept_title: g.concept_title,
      result_image_url: g.result_image_url,
      credits_spent: g.credits_spent,
      created_at: g.created_at,
    })),
    purchases: (purchases ?? []).map((p) => ({
      id: p.id,
      user_email: profile.email,
      package_name: p.package_id ? (nameByPackage.get(p.package_id) ?? null) : null,
      credits: p.credits,
      amount_cents: p.amount_cents,
      currency: p.currency,
      status: p.status,
      provider: p.provider,
      created_at: p.created_at,
    })),
    transactions: (transactions ?? []).map((t) => ({
      id: t.id,
      amount: t.amount,
      reason: t.reason,
      created_at: t.created_at,
    })),
  };
}
