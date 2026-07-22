import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { AdminNav } from "@/components/admin/admin-nav";
import { listAllGenerations } from "@/lib/admin/queries";
import type { GenerationStatus } from "@/lib/supabase/types";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Üretimler" };

const STATUS_LABEL: Record<string, string> = {
  pending: "Sırada",
  processing: "Üretiliyor",
  completed: "Tamamlandı",
  failed: "Başarısız",
};

const FILTERS: { value: GenerationStatus | undefined; label: string }[] = [
  { value: undefined, label: "Tümü" },
  { value: "completed", label: "Tamamlandı" },
  { value: "failed", label: "Başarısız" },
  { value: "processing", label: "Üretiliyor" },
  { value: "pending", label: "Sırada" },
];

export default async function AdminGenerationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatus = (["pending", "processing", "completed", "failed"] as const).includes(
    status as GenerationStatus,
  )
    ? (status as GenerationStatus)
    : undefined;
  const generations = await listAllGenerations(100, validStatus);

  return (
    <PageHeader
      title="Üretimler"
      description={`${generations.length} üretim gösteriliyor.`}
      width="wide"
    >
      <AdminNav />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `?status=${f.value}` : "?"}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              validStatus === f.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {generations.length === 0 ? (
        <p className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
          Bu filtreyle eşleşen üretim yok.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {generations.map((g) => (
            <div
              key={g.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-square bg-muted">
                {g.result_image_url ? (
                  <Image
                    src={g.result_image_url}
                    alt={g.concept_title ?? "Üretim"}
                    fill
                    sizes="(min-width: 1024px) 16vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-xs text-muted-foreground">
                    görsel yok
                  </div>
                )}
                <Badge
                  variant={g.status === "completed" ? "default" : "secondary"}
                  className="absolute left-2 top-2 text-[10px]"
                >
                  {STATUS_LABEL[g.status] ?? g.status}
                </Badge>
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-medium">
                  {g.concept_title ?? "İsimsiz konsept"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {g.user_email ?? "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatDate(g.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageHeader>
  );
}
