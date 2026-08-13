import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PillVariant = "primary" | "dark" | "translucent";

/** Lime dolgu = birincil aksiyon, koyu = ikincil, yarı saydam = fotoğraf üstü. */
const VARIANT_CLASSES: Record<PillVariant, string> = {
  primary: "bg-secondary text-secondary-foreground",
  dark: "bg-foreground text-secondary",
  translucent: "bg-[#122835]/25 text-white backdrop-blur-sm",
};

/**
 * Sitenin tek CTA biçimi: mono/uppercase etiket + (opsiyonel) sağda koyu
 * daire içinde çıkış oku. Her yerde aynı yükseklikte durması için padding
 * ok olup olmamasına göre değişir.
 */
export function PillLink({
  href,
  children,
  variant = "primary",
  withArrow = true,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: PillVariant;
  withArrow?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-4 rounded-full py-2 pl-5 pr-2 font-mono text-xs uppercase tracking-[0.12em] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        !withArrow && "pr-5",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
      {withArrow && (
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-foreground text-secondary">
          <ArrowUpRight className="size-3.5" />
        </span>
      )}
    </Link>
  );
}
