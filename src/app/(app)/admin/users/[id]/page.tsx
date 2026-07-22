import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Coins, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CreditAdjustDialog } from "@/components/admin/credit-adjust-dialog";
import { getUserDetail } from "@/lib/admin/queries";
import { ROUTES } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin — Kullanıcı Detayı" };

const STATUS_LABEL: Record<string, string> = {
  pending: "Sırada",
  processing: "Üretiliyor",
  completed: "Tamamlandı",
  failed: "Başarısız",
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getUserDetail(id);
  if (!detail) notFound();

  const { profile } = detail;
  const initial =
    profile.full_name?.[0]?.toUpperCase() ?? profile.email?.[0]?.toUpperCase() ?? "U";

  return (
    <PageHeader
      title={
        <span className="flex items-center gap-3">
          <Avatar size="lg" className="border border-border">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
          {profile.full_name || profile.email}
          {profile.is_admin && (
            <Badge variant="outline" className="text-primary">
              Admin
            </Badge>
          )}
        </span>
      }
      description={`${profile.email ?? "—"} · ${formatDate(profile.created_at)} tarihinde katıldı`}
      width="wide"
      actions={<CreditAdjustDialog userId={profile.id} email={profile.email} />}
    >
      <Link
        href={`${ROUTES.admin}/users`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Kullanıcılara dön
      </Link>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Coins className="size-5" />}
          label="Mevcut bakiye"
          value={String(detail.balance)}
        />
        <StatCard
          icon={<TrendingUp className="size-5" />}
          label="Toplam yüklenen"
          value={String(detail.totalEarned)}
        />
        <StatCard
          icon={<TrendingDown className="size-5" />}
          label="Toplam harcanan"
          value={String(detail.totalSpent)}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-heading text-lg font-medium">Üretimler</h2>
          {detail.generations.length === 0 ? (
            <p className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
              Henüz üretim yok.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {detail.generations.map((g) => (
                <div
                  key={g.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                  title={g.concept_title ?? undefined}
                >
                  {g.result_image_url ? (
                    <Image
                      src={g.result_image_url}
                      alt={g.concept_title ?? "Üretim"}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center">
                      <Badge
                        variant={g.status === "completed" ? "default" : "secondary"}
                        className="text-[10px]"
                      >
                        {STATUS_LABEL[g.status] ?? g.status}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 font-heading text-lg font-medium">Satın almalar</h2>
          {detail.purchases.length === 0 ? (
            <p className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
              Henüz satın alma yok.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <ul className="divide-y divide-border">
                {detail.purchases.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">
                        {p.package_name ?? "Paket"} · {p.credits} kredi
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(p.created_at)}
                      </p>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {formatPrice(p.amount_cents, p.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-3 font-heading text-lg font-medium">Kredi hareketleri</h2>
        {detail.transactions.length === 0 ? (
          <p className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
            Henüz hareket yok.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-border">
                {detail.transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="px-4 py-2.5">{t.reason}</td>
                    <td
                      className={`px-4 py-2.5 text-right tabular-nums font-medium ${
                        t.amount >= 0 ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {t.amount >= 0 ? "+" : ""}
                      {t.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageHeader>
  );
}
