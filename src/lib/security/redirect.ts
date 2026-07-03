import { ROUTES } from "@/lib/constants";

/**
 * Açık yönlendirme (open redirect) koruması: yalnızca site içi,
 * "/" ile başlayan (ama "//" olmayan) yollar kabul edilir.
 */
export function safeInternalPath(raw: string): string {
  if (raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\")) {
    return raw;
  }
  return ROUTES.dashboard;
}
