import type { Metadata } from "next";
import { Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PurchaseButton } from "@/components/billing/purchase-button";
import { PackageCard } from "@/components/billing/package-card";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser, getCredits, getActivePackages } from "@/lib/queries";
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
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            action={
              <form action={purchasePackageAction}>
                <input type="hidden" name="package_id" value={pkg.id} />
                <PurchaseButton
                  className="w-full"
                  variant={pkg.is_popular ? "secondary" : "outline"}
                >
                  Satın al
                </PurchaseButton>
              </form>
            }
          />
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Ödeme altyapısı şu an <strong>mock</strong> modundadır — gerçek tahsilat
        yapılmaz. Stripe/Iyzico entegrasyonu ileride eklenecektir.
      </p>
    </PageHeader>
  );
}
