import type { ReactNode } from "react";
import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { Package } from "@/lib/supabase/types";

/**
 * Paket kartının görsel kısmı (isim/fiyat/kredi/özellikler) — hem landing
 * hem billing sayfasında ortak. Alt aksiyon (CTA) sayfaya göre farklı
 * davranır (register'a mı yoksa gerçek satın alma formuna mı gittiği),
 * bu yüzden `action` slot'u olarak çağıran taraftan geliyor.
 *
 * `is_popular` paketi: koyu zemin + içeride rozet + masaüstünde hafif
 * yükseltilmiş (scale) — diğer iki paket açık zeminde kalır.
 */
export function PackageCard({
  pkg,
  action,
}: {
  pkg: Package;
  action?: ReactNode;
}) {
  const popular = pkg.is_popular;
  return (
    <Card
      className={cn(
        "flex flex-col",
        popular &&
          "border-transparent bg-[#171512] text-white shadow-[0_30px_60px_-24px_rgba(23,21,18,0.7)] lg:scale-[1.04]",
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle
            className={cn("font-heading text-xl", popular && "text-white")}
          >
            {pkg.name}
          </CardTitle>
          {popular && (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              En çok tercih edilen
            </span>
          )}
        </div>
        <p className={cn("text-sm", popular ? "text-white/50" : "text-muted-foreground")}>
          {pkg.credits} görsel hakkı
        </p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-heading text-4xl font-semibold">
            {formatPrice(pkg.price_cents, pkg.currency)}
          </span>
          <span className={cn("text-base font-medium", popular ? "text-white/50" : "text-muted-foreground")}>
            / paket
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-6">
        <ul
          className={cn(
            "space-y-2 text-sm",
            popular ? "text-white/75" : "text-foreground",
          )}
        >
          {pkg.description && (
            <li className="flex items-center gap-2">
              <Check
                className={cn("size-4 shrink-0", popular ? "text-primary" : "text-primary")}
              />{" "}
              {pkg.description}
            </li>
          )}
          <li className="flex items-center gap-2">
            <Check className="size-4 shrink-0 text-primary" /> Görsel başı{" "}
            {formatPrice(Math.round(pkg.price_cents / pkg.credits), pkg.currency)}
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-4 shrink-0 text-primary" /> Ticari kullanım
            hakkı
          </li>
        </ul>
        {action}
      </CardContent>
    </Card>
  );
}
