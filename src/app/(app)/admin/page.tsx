import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { CreditAdjustDialog } from "@/components/admin/credit-adjust-dialog";
import { listUsersWithCredits } from "@/lib/admin/queries";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const users = await listUsersWithCredits();

  return (
    <PageHeader
      title="Admin"
      description={`${users.length} kullanıcı gösteriliyor.`}
      width="wide"
    >
      <div className="mt-8 overflow-x-auto rounded-xl border border-border">
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
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{u.full_name || u.email}</span>
                    {u.is_admin && <Badge variant="outline">Admin</Badge>}
                  </div>
                  {u.full_name && (
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(u.created_at)}
                </td>
                <td className="px-4 py-3 tabular-nums">{u.balance}</td>
                <td className="px-4 py-3 text-right">
                  <CreditAdjustDialog userId={u.id} email={u.email} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageHeader>
  );
}
