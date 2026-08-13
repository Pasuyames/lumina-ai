"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Görünüme girince 0'dan `percent`'e dolan ince ilerleme çubuğu. */
export function AnimatedProgressBar({
  percent,
  className,
  fillClassName,
}: {
  percent: number;
  className?: string;
  fillClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFilled(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-black/10", className)}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-[width] duration-[900ms] ease-out",
          fillClassName,
        )}
        style={{ width: filled ? `${percent}%` : "0%" }}
      />
    </div>
  );
}
