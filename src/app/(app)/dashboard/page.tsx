import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Sparkles, Coins, Images, ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser, getCredits, getGenerations } from "@/lib/queries";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Panel" };

export default async function DashboardPage() {
  const user = (await getCurrentUser())!;
  const [credits, generations] = await Promise.all([
    getCredits(user.id),
    getGenerations(user.id, 6),
  ]);
  const balance = credits?.balance ?? 0;
  const firstName =
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    "tekrar";

  return (
    <PageHeader
      title={`Merhaba, ${firstName} 👋`}
      description="Stüdyonuza hoş geldiniz. Yeni bir görsel üretmeye hazır mısınız?"
      width="wide"
      actions={
        <ButtonLink href={ROUTES.studio} size="lg" className="gap-2">
          <Sparkles className="size-4" /> Yeni görsel üret
        </ButtonLink>
      }
    >
      {/* Özet kartları */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Coins className="size-5" />}
          label="Kalan kredi"
          value={String(balance)}
          hint={balance === 0 ? "Paket alarak devam edin" : "her görsel = 1 kredi"}
        />
        <StatCard
          icon={<Images className="size-5" />}
          label="Toplam üretim"
          value={String(generations.length)}
          hint="son 6 gösteriliyor"
        />
        <StatCard
          icon={<Sparkles className="size-5" />}
          label="Toplam harcanan"
          value={String(credits?.total_spent ?? 0)}
          hint="kredi"
        />
      </div>

      {/* Son üretimler */}
      <div className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Son üretimler</h2>
          <ButtonLink
            href={ROUTES.generations}
            variant="ghost"
            size="sm"
            className="gap-1"
          >
            Tümü <ArrowRight className="size-4" />
          </ButtonLink>
        </div>

        {generations.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="size-6" />}
            title="Henüz üretim yok. İlk lüks görselinizi oluşturun."
            action={
              <ButtonLink href={ROUTES.studio} className="mt-1">
                Stüdyoyu aç
              </ButtonLink>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {generations.map((g) => (
              <Link
                key={g.id}
                href={`${ROUTES.generations}/${g.id}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-muted"
              >
                {g.result_image_url ? (
                  <Image
                    src={g.result_image_url}
                    alt={g.concept_title ?? "Üretim"}
                    fill
                    sizes="(min-width: 1024px) 16vw, 33vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-xs text-muted-foreground">
                    {g.status}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-2">
                  <p className="truncate text-xs font-medium">
                    {g.concept_title ?? "Untitled"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(g.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageHeader>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <span className="text-primary">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="font-heading text-3xl font-semibold tabular-nums">
          {value}
        </div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
