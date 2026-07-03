import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 "proxy" konvansiyonu (eski "middleware" yerine).
 * Her istekte Supabase oturumunu tazeler ve korumalı rotaları korur.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aşağıdakiler hariç tüm yollarda çalış:
     * - _next/static, _next/image, favicon, ve görsel uzantıları
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
