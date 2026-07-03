import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { serverEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role istemcisi: RLS'i bypass eder.
 * SADECE güvenilen sunucu kodunda (kredi düşme, sistem yazımları) kullanın.
 * Asla bir Client Component'e veya tarayıcıya sızdırmayın.
 */
export function createAdminClient() {
  return createClient<Database>(
    env.supabaseUrl,
    serverEnv.supabaseServiceRoleKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
