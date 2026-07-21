import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Üstte gösterilen dairesel ikon rozeti — verilmezse render edilmez. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Alt aksiyon (ör. CTA butonu) — verilmezse render edilmez. */
  action?: ReactNode;
  className?: string;
}

/**
 * Kesikli çerçeveli boş durum kartı (dashboard'daki kanonik tasarım).
 * İkon/açıklama/aksiyon opsiyoneldir — sade metin varyantları da destekler.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        {icon && (
          <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            {icon}
          </span>
        )}
        <p className="text-muted-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {action}
      </CardContent>
    </Card>
  );
}
