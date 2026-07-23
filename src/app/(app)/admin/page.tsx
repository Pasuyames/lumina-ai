import Link from "next/link";
import type { Metadata } from "next";
import { Users, Coins, Banknote, Images, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  getAdminStats,
  listAllGenerations,
  listAllPurchases,
} from "@/lib/admin/queries";
import { ROUTES } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin — Genel Bakış" };

const STATUS_LABEL: Record<string, string> = {
  pending: "Sırada",
  processing: "Üretiliyor",
  completed: "Tamamlandı",
  failed: "Başarısız",
};

export default async function AdminOverviewPage() {
  const [stats, recentGenerations, recentPurchases] = await Promise.all([
    getAdminStats(),
    listAllGenerations(5),
    listAllPurchases(5),
  ]);

  const successRate =
    stats.generationCount === 0
      ? null
      : Math.round((stats.completedCount / stats.generationCount) * 100);

  return (
    <PageHeader
      title="Admin"
      description="Renza'nın genel durumuna bakın."
      width="wide"
    >
      <AdminNav />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="size-5" />}
          label="Toplam kullanıcı"
          value={String(stats.userCount)}
          hint={`son 7 günde +${stats.newUsersThisWeek}`}
        />
        <StatCard
          icon={<Coins className="size-5" />}
          label="Sistemdeki kredi"
          value={String(stats.totalBalance)}
          hint="tüm kullanıcıların bakiyesi toplamı"
        />
        <StatCard
          icon={<Banknote className="size-5" />}
          label="Toplam gelir"
          value={formatPrice(stats.revenueCents)}
          hint="başarılı satın almalar"
        />
        <StatCard
          icon={<Images className="size-5" />}
          label="Toplam üretim"
          value={String(stats.generationCount)}
          hint={successRate === null ? "henüz üretim yok" : `%${successRate} başarı oranı`}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-medium">Son üretimler</h2>
            <Link
              href={`${ROUTES.admin}/generations`}
              className="text-sm text-primary hover:underline"
            >
              Tümü
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            {recentGenerations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Henüz üretim yok.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentGenerations.map((g) => (
                  <li key={g.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {g.concept_title ?? "İsimsiz konsept"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {g.user_email ?? "—"} · {formatDate(g.created_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {g.status === "completed" ? (
                        <CheckCircle2 className="size-4 text-primary" />
                      ) : g.status === "failed" ? (
                        <XCircle className="size-4 text-destructive" />
                      ) : null}
                      <Badge variant={g.status === "completed" ? "default" : "secondary"}>
                        {STATUS_LABEL[g.status] ?? g.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-medium">Son satın almalar</h2>
            <Link
              href={`${ROUTES.admin}/purchases`}
              className="text-sm text-primary hover:underline"
            >
              Tümü
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            {recentPurchases.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Henüz satın alma yok.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentPurchases.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {p.package_name ?? "Paket"} · {p.credits} kredi
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.user_email ?? "—"} · {formatDate(p.created_at)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium tabular-nums">
                      {formatPrice(p.amount_cents, p.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageHeader>
  );
}
