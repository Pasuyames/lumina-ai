import { NextResponse } from "next/server";

/**
 * Sağlık kontrolü — yalnızca kritik ortam değişkenlerinin VARLIĞINI
 * (boolean) bildirir, değerlerini asla döndürmez. /api korumalı
 * rotalar arasında değildir (bkz. src/lib/supabase/middleware.ts
 * PROTECTED_PREFIXES), bu yüzden oturum gerektirmez.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    checks: {
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      geminiKey: Boolean(process.env.GEMINI_API_KEY),
    },
  });
}
