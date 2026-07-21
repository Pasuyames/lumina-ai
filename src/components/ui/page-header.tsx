import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const WIDTH_CLASS: Record<"wide" | "narrow", string> = {
  wide: "max-w-6xl",
  narrow: "max-w-5xl",
};

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Başlığın sağındaki aksiyon slotu (ör. CTA butonu, kredi rozeti). */
  actions?: ReactNode;
  /** Sayfa konteynerinin genişliği — mevcut değerler korunur, sadece adlandırılır. */
  width: "wide" | "narrow";
  /** Başlık bloğu ile aksiyon slotunun dikey hizası (varsayılan: "end"). */
  align?: "center" | "end";
  children?: ReactNode;
}

/**
 * Sayfa üst başlığı + açıklama + sağ aksiyon slotu ve sayfa konteyner
 * genişliğini tek yerden yönetir. `children` varsa, başlığın altına
 * (sayfanın geri kalan içeriği olarak) aynı konteyner içinde render edilir.
 */
export function PageHeader({
  title,
  description,
  actions,
  width,
  align = "end",
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("mx-auto px-4 py-10 sm:px-6", WIDTH_CLASS[width])}>
      <div
        className={cn(
          "flex flex-wrap justify-between gap-4",
          align === "center" ? "items-center" : "items-end",
        )}
      >
        <div>
          <h1 className="font-heading text-3xl font-semibold">{title}</h1>
          {description && (
            <p className="mt-1 text-muted-foreground">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
