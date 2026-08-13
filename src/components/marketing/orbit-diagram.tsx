"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** Kapsayıcı `size-64` (256px) — inset-0/6/12 halka rehberlerinin yarıçapları. */
const DEFAULT_RADIUS = 128;

export type OrbitPill = {
  thumb: string;
  label: string;
  badge: string;
  /** Yörüngedeki başlangıç açısı (derece). */
  startAngle: number;
  /** Bir tam tur için saniye — her rozet farklı olsun diye. */
  duration: number;
  /**
   * Yörünge yarıçapı (px) — çizilen 3 halka rehberinden birine denk
   * gelmeli (128/104/80). Farklı hızlardaki rozetler AYNI yarıçapta
   * olursa açıları çakıştığında tam üst üste biner; farklı yarıçap bunu
   * geometrik olarak imkansız kılar.
   */
  radius?: number;
};

function Pill({ pill }: { pill: OrbitPill }) {
  const ref = useRef<HTMLDivElement>(null);
  const radius = pill.radius ?? DEFAULT_RADIUS;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const angle =
        pill.startAngle + ((now - start) / 1000 / pill.duration) * 360;
      el.style.transform = `rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle}deg)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [pill.startAngle, pill.duration, radius]);

  return (
    <div
      ref={ref}
      className="absolute left-1/2 top-1/2"
      style={{
        transform: `rotate(${pill.startAngle}deg) translateY(-${radius}px) rotate(${-pill.startAngle}deg)`,
      }}
    >
      <div className="flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-card py-1.5 pl-1.5 pr-3 shadow-lg ring-1 ring-black/5">
        <Image
          src={pill.thumb}
          alt=""
          width={160}
          height={160}
          className="size-7 rounded-full object-cover"
        />
        <p className="whitespace-nowrap text-xs font-medium text-foreground">
          {pill.label}
        </p>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
          {pill.badge}
        </span>
      </div>
    </div>
  );
}

/**
 * Merkezdeki sabit çekirdeğin etrafında farklı hızlarda dönen rozetler —
 * "tek yükleme, çok sayıda kare" fikrini anlatan küçük diyagram.
 */
export function OrbitDiagram({
  center,
  pills,
}: {
  center: React.ReactNode;
  pills: OrbitPill[];
}) {
  return (
    <div className="relative mx-auto size-64">
      <div className="absolute inset-0 rounded-full border border-foreground/10" />
      <div className="absolute inset-6 rounded-full border border-foreground/10" />
      <div className="absolute inset-12 rounded-full border border-foreground/10" />

      <div className="absolute inset-0 flex items-center justify-center">
        {center}
      </div>

      {pills.map((pill) => (
        <Pill key={pill.label} pill={pill} />
      ))}
    </div>
  );
}
