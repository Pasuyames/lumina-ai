"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type GrowBar = {
  label: string;
  /** Sütunun göreli yüksekliği (0-1). */
  value: number;
  /** true ise koyu vurgu rengiyle çizilir (serideki "asıl" sütun). */
  highlighted?: boolean;
};

/**
 * Görünüme girince soldan sağa sırayla yükselen sütun grafiği. Sütunlar
 * arası 80ms gecikme ile "büyüme" hissi verilir.
 */
export function GrowBarChart({
  bars,
  className,
}: {
  bars: GrowBar[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGrown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("flex h-24 items-end gap-2", className)}>
      {bars.map((bar, i) => (
        <div
          key={bar.label}
          // min-w-0 şart: flex öğesinin varsayılan `min-width:auto` değeri,
          // etiket sütundan genişse grafiği panelin dışına taşırıyor.
          className="flex min-w-0 flex-1 flex-col items-center gap-2"
        >
          <div className="flex h-20 w-full items-end">
            <div
              className={cn(
                "rz-growbar w-full rounded-sm transition-[height] duration-700 ease-out",
                bar.highlighted ? "bg-foreground" : "bg-black/10",
              )}
              style={{
                // En küçük değer bile görünür kalsın diye %8 taban.
                height: grown ? `${8 + bar.value * 92}%` : "0%",
                transitionDelay: `${i * 80}ms`,
              }}
            />
          </div>
          <p className="w-full truncate text-center text-[10px] leading-none text-foreground/40">
            {bar.label}
          </p>
        </div>
      ))}
    </div>
  );
}
