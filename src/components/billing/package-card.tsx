import type { ReactNode } from "react";
import { Check, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
 */
export function PackageCard({
  pkg,
  action,
}: {
  pkg: Package;
  action?: ReactNode;
}) {
  return (
    <div className="relative">
      {/* Card'ın overflow-hidden'ı yüzünden rozet Card İÇİNDE değil, bu
          sarmalayıcıya göre konumlandırılıyor — aksi halde üst kenardan
          taşan kısmı kırpılır. */}
      {pkg.is_popular && (
        <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 gap-1">
          <Star className="size-3" /> En popüler
        </Badge>
      )}
      <Card
        className={cn(
          "flex flex-col",
          pkg.is_popular && "border-primary shadow-lg ring-1 ring-primary/20",
        )}
      >
        <CardHeader>
          <CardTitle className="font-heading text-xl">{pkg.name}</CardTitle>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-heading text-4xl font-semibold">
              {formatPrice(pkg.price_cents, pkg.currency)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {pkg.credits} görsel hakkı · görsel başı{" "}
            {formatPrice(Math.round(pkg.price_cents / pkg.credits), pkg.currency)}
          </p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-6">
          <ul className="space-y-2 text-sm">
            {pkg.description && (
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" /> {pkg.description}
              </li>
            )}
            <li className="flex items-center gap-2">
              <Check className="size-4 text-primary" /> 2K çözünürlük
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-4 text-primary" /> Ticari kullanım hakkı
            </li>
          </ul>
          {action}
        </CardContent>
      </Card>
    </div>
  );
}
