import type { Metadata } from "next";
import { Users, Coins, Banknote } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CreditAdjustDialog } from "@/components/admin/credit-adjust-dialog";
import { listUsersWithCredits, getAdminStats } from "@/lib/admin/queries";
import { formatDate, formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const [users, stats] = await Promise.all([
    listUsersWithCredits(),
    getAdminStats(),
  ]);

  return (
    <PageHeader
      title="Admin"
      description="Kullanıcıları ve kredi bakiyelerini yönetin."
      width="wide"
    >
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Users className="size-5" />}
          label="Toplam kullanıcı"
          value={String(stats.userCount)}
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
          hint="başarılı satın almalar (mock ödeme dahil)"
        />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-accent/30 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Kullanıcı</th>
              <th className="px-4 py-3 font-medium">Kayıt tarihi</th>
              <th className="px-4 py-3 font-medium">Kredi</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const initial =
                u.full_name?.[0]?.toUpperCase() ??
                u.email?.[0]?.toUpperCase() ??
                "U";
              return (
                <tr key={u.id} className="transition-colors hover:bg-accent/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {u.full_name || u.email}
                          </span>
                          {u.is_admin && (
                            <Badge variant="outline" className="text-primary">
                              Admin
                            </Badge>
                          )}
                        </div>
                        {u.full_name && (
                          <p className="text-xs text-muted-foreground">
                            {u.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/50 px-2.5 py-1 font-medium">
                      <Coins className="size-3.5 text-primary" />
                      {u.balance}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CreditAdjustDialog userId={u.id} email={u.email} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageHeader>
  );
}
