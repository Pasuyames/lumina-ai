import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/admin-nav";
import { listAllPurchases } from "@/lib/admin/queries";
import { formatDate, formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin — Satın Almalar" };

const STATUS_LABEL: Record<string, string> = {
  pending: "Bekliyor",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade edildi",
};

export default async function AdminPurchasesPage() {
  const purchases = await listAllPurchases(100);
  const totalRevenue = purchases
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount_cents, 0);

  return (
    <PageHeader
      title="Satın Almalar"
      description={`${purchases.length} işlem · toplam ${formatPrice(totalRevenue)} gelir`}
      width="wide"
    >
      <AdminNav />

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-accent/30 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Kullanıcı</th>
              <th className="px-4 py-3 font-medium">Paket</th>
              <th className="px-4 py-3 font-medium">Tutar</th>
              <th className="px-4 py-3 font-medium">Sağlayıcı</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {purchases.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{p.user_email ?? "—"}</td>
                <td className="px-4 py-3">
                  {p.package_name ?? "—"} · {p.credits} kredi
                </td>
                <td className="px-4 py-3 tabular-nums font-medium">
                  {formatPrice(p.amount_cents, p.currency)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.provider ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === "paid" ? "default" : "secondary"}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(p.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {purchases.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Henüz satın alma yok.
          </p>
        )}
      </div>
    </PageHeader>
  );
}
