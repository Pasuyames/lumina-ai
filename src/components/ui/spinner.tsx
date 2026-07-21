import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Inline yükleniyor göstergesi — `Loader2` + `animate-spin` sarmalayıcısı. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin", className)} />;
}
