import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminNav } from "@/components/admin/admin-nav";
import { listUsersWithCredits } from "@/lib/admin/queries";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin — Kullanıcılar" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const users = await listUsersWithCredits(200, q?.trim() || undefined);

  return (
    <PageHeader
      title="Kullanıcılar"
      description={`${users.length} kullanıcı${q ? ` — "${q}" için sonuçlar` : ""}`}
      width="wide"
    >
      <AdminNav />

      <form className="relative mb-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Ad veya e-posta ara..."
          className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </form>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-accent/30 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Kullanıcı</th>
              <th className="px-4 py-3 font-medium">Kayıt tarihi</th>
              <th className="px-4 py-3 font-medium">Kredi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const initial =
                u.full_name?.[0]?.toUpperCase() ??
                u.email?.[0]?.toUpperCase() ??
                "U";
              return (
                <tr key={u.id}>
                  <td className="p-0">
                    <Link
                      href={`${ROUTES.admin}/users/${u.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/20"
                    >
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
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{u.balance}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageHeader>
  );
}
