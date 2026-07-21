import type { Metadata } from "next";
import { Check, Coins, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseButton } from "@/components/billing/purchase-button";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser, getCredits, getActivePackages } from "@/lib/queries";
import { formatPrice } from "@/lib/utils/format";
import { purchasePackageAction } from "./actions";

export const metadata: Metadata = { title: "Kredi & Paketler" };

export default async function BillingPage() {
  const user = (await getCurrentUser())!;
  const [credits, packages] = await Promise.all([
    getCredits(user.id),
    getActivePackages(),
  ]);
  const balance = credits?.balance ?? 0;

  return (
    <PageHeader
      title="Kredi & Paketler"
      description="Her başarılı görsel üretimi 1 kredi harcar."
      width="narrow"
    >
      {/* Mevcut bakiye */}
      <Card className="mt-6">
        <CardContent className="flex items-center gap-4 py-5">
          <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Coins className="size-6" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Mevcut bakiyeniz</p>
            <p className="font-heading text-3xl font-semibold tabular-nums">
              {balance}{" "}
              <span className="text-base font-normal text-muted-foreground">
                kredi
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Paketler */}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative flex flex-col ${
              pkg.is_popular
                ? "border-primary shadow-lg ring-1 ring-primary/20"
                : ""
            }`}
          >
            {pkg.is_popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1">
                <Star className="size-3" /> En popüler
              </Badge>
            )}
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
              <form action={purchasePackageAction}>
                <input type="hidden" name="package_id" value={pkg.id} />
                <PurchaseButton
                  className="w-full"
                  variant={pkg.is_popular ? "default" : "outline"}
                >
                  Satın al
                </PurchaseButton>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Ödeme altyapısı şu an <strong>mock</strong> modundadır — gerçek tahsilat
        yapılmaz. Stripe/Iyzico entegrasyonu ileride eklenecektir.
      </p>
    </PageHeader>
  );
}
