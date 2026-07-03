import Link from "next/link";
import { Coins, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

/**
 * Kullanıcının mevcut kredisini gösterir.
 * Bakiye 0 ise doğrudan "Paket Satın Al" çağrısına dönüşür.
 */
export function CreditBadge({
  balance,
  className,
}: {
  balance: number;
  className?: string;
}) {
  if (balance <= 0) {
    return (
      <Link
        href={ROUTES.billing}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90",
          className,
        )}
      >
        <Plus className="size-3.5" />
        Paket Satın Al
      </Link>
    );
  }

  return (
    <Link
      href={ROUTES.billing}
      title="Kredi geçmişi ve paketler"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium tabular-nums transition hover:border-primary/40 hover:bg-accent/40",
        className,
      )}
    >
      <Coins className="size-3.5 text-primary" />
      <span>{balance}</span>
      <span className="text-muted-foreground">kredi</span>
    </Link>
  );
}
