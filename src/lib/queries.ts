import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Credits, Generation, Package, Profile } from "@/lib/supabase/types";

/** Oturumdaki kullanıcıyı döndürür (yoksa null). */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Kullanıcının profil kaydını döndürür. */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

/** Kullanıcının kredi bakiyesini döndürür. */
export async function getCredits(userId: string): Promise<Credits | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

/**
 * 10 dakikadan uzun süredir 'processing' kalmış üretimleri 'failed' yapar.
 * (Sunucu çökmesi / zaman aşımı sonrası askıda kalan kayıtlar için.)
 * Kredi zaten yalnızca başarılı render sonrası düştüğü için iade gerekmez.
 */
export async function failStaleGenerations(userId: string): Promise<void> {
  const supabase = await createClient();
  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  await supabase
    .from("generations")
    .update({ status: "failed", error: "Zaman aşımı: üretim tamamlanamadı." })
    .eq("user_id", userId)
    .in("status", ["pending", "processing"])
    .lt("created_at", cutoff);
}

/** Kullanıcının üretim geçmişi (en yeni önce). */
export async function getGenerations(
  userId: string,
  limit = 24,
): Promise<Generation[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

/** Tek bir üretim kaydı (kullanıcıya ait olmalı). */
export async function getGenerationById(
  userId: string,
  id: string,
): Promise<Generation | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

/** Aktif kredi paketleri (fiyatlandırma sayfası). */
export async function getActivePackages(): Promise<Package[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}
