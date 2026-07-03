"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { GripVertical, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Önce/sonra karşılaştırma slider'ı — yeni bağımlılık yok.
 * Pointer event'lerle sürüklenen dikey ayraç; klavye erişimi (ok tuşları)
 * ve dokunmatik destek dahil. Görsellerden biri eksikse (404/undefined)
 * kırık görsel göstermek yerine tek görsel veya nazik boş durum gösterir.
 */
export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "Önce",
  afterAlt = "Sonra",
  className,
}: {
  beforeSrc?: string | null;
  afterSrc?: string | null;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}) {
  const [position, setPosition] = useState(50); // yüzde, 0-100
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  }

  function handlePointerUp() {
    draggingRef.current = false;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 10 : 3;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPosition((p) => Math.max(0, p - step));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPosition((p) => Math.min(100, p + step));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPosition(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPosition(100);
    }
  }

  const hasBefore = !!beforeSrc && !beforeError;
  const hasAfter = !!afterSrc && !afterError;

  // Hiçbir görsel yoksa: zarif boş durum, kırık görsel ASLA.
  if (!hasBefore && !hasAfter) {
    return (
      <div
        className={cn(
          "flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 text-center",
          className,
        )}
      >
        <ImageOff className="size-8 text-muted-foreground/60" />
        <p className="px-6 text-sm text-muted-foreground">
          Karşılaştırma görselleri hazırlanıyor.
        </p>
      </div>
    );
  }

  // Yalnızca biri varsa: tek görsel göster (slider anlamsız olur).
  if (!hasBefore || !hasAfter) {
    const src = hasAfter ? afterSrc! : beforeSrc!;
    const alt = hasAfter ? afterAlt : beforeAlt;
    return (
      <div
        className={cn(
          "relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-muted",
          className,
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 40vw, 90vw"
          className="object-cover"
          onError={() => (hasAfter ? setAfterError(true) : setBeforeError(true))}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-[4/5] w-full touch-none overflow-hidden rounded-2xl border border-border bg-muted select-none",
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* SONRA — tam genişlik, altta */}
      <Image
        src={afterSrc!}
        alt={afterAlt}
        fill
        sizes="(min-width: 1024px) 40vw, 90vw"
        className="pointer-events-none object-cover"
        onError={() => setAfterError(true)}
      />

      {/* ÖNCE — clip-path ile kırpılmış, üstte */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeSrc!}
          alt={beforeAlt}
          fill
          sizes="(min-width: 1024px) 40vw, 90vw"
          className="object-cover"
          onError={() => setBeforeError(true)}
        />
      </div>

      {/* Etiketler */}
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
        Önce
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
        Sonra
      </span>

      {/* Ayraç + tutamaç — klavye erişilebilir */}
      <div
        role="slider"
        tabIndex={0}
        aria-label="Önce/sonra karşılaştırma konumu"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        onKeyDown={handleKeyDown}
        className="absolute inset-y-0 flex w-6 -translate-x-1/2 cursor-ew-resize items-center justify-center outline-none"
        style={{ left: `${position}%` }}
      >
        <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-background/90 shadow-sm" />
        <span className="grid size-8 place-items-center rounded-full bg-background text-foreground shadow-md ring-1 ring-border focus-visible:ring-2 focus-visible:ring-primary">
          <GripVertical className="size-4" />
        </span>
      </div>
    </div>
  );
}
