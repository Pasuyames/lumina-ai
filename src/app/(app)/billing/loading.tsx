import { Skeleton } from "@/components/ui/skeleton";

/** Kredi & Paketler yüklenirken gösterilen iskelet — gerçek sayfayla aynı
 * konteyner genişliği (bkz. page-header.tsx width="narrow"). */
export default function BillingLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-2 h-5 w-72" />

      {/* Mevcut bakiye */}
      <div className="mt-6 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-xl" />
          <div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-8 w-20" />
          </div>
        </div>
      </div>

      {/* Paketler */}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-4 w-36" />
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="mt-2 h-10 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
