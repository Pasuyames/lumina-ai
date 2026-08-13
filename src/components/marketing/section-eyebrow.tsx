import { cn } from "@/lib/utils";

/**
 * Her bölüm başlığının üstündeki küçük kare işaretli mono/uppercase etiket.
 * Varsayılan olarak ortalanır; sola yaslı başlıklarda `align="left"`.
 */
export function SectionEyebrow({
  children,
  align = "center",
  className,
}: {
  children: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-foreground/70",
        align === "center" ? "justify-center" : "justify-start",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 bg-foreground" />
      {children}
    </p>
  );
}
