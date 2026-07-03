import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Sunucu (Server Component / Route Handler / Server Action) tarafında
 * kullanıcının oturumuyla çalışan Supabase istemcisi.
 * Next.js 16: cookies() asenkron.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component içinden çağrıldığında set engellenir;
            // oturum yenileme middleware tarafından yürütülür.
          }
        },
      },
    },
  );
}
