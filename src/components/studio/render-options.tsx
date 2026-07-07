"use client";

import { cn } from "@/lib/utils";
import { creditCostFor, type RenderQuality } from "@/lib/credits";

/** Nano Banana'nın desteklediği en-boy oranı seçenekleri (varsayılan 4:5). */
export const ASPECT_RATIO_OPTIONS = [
  { value: "1:1", label: "1:1" },
  { value: "4:5", label: "4:5" },
  { value: "3:4", label: "3:4" },
  { value: "9:16", label: "9:16" },
  { value: "16:9", label: "16:9" },
] as const;

export type AspectRatioValue = (typeof ASPECT_RATIO_OPTIONS)[number]["value"];

const QUALITY_OPTIONS: { value: RenderQuality; label: string }[] = [
  { value: "2K", label: "2K — 1 kredi" },
  { value: "4K", label: "4K — 2 kredi" },
];

/** Render öncesi en-boy oranı ve kalite seçici — hem AI konsept hem hazır stüdyo akışında ortak kullanılır. */
export function RenderOptions({
  aspectRatio,
  onAspectRatioChange,
  quality,
  onQualityChange,
  disabled,
}: {
  aspectRatio: AspectRatioValue;
  onAspectRatioChange: (v: AspectRatioValue) => void;
  quality: RenderQuality;
  onQualityChange: (v: RenderQuality) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <span className="text-sm font-medium text-foreground">
          En-boy oranı
        </span>
        <div
          role="radiogroup"
          aria-label="En-boy oranı"
          className="mt-2 flex flex-wrap gap-1.5"
        >
          {ASPECT_RATIO_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={aspectRatio === opt.value}
              disabled={disabled}
              onClick={() => onAspectRatioChange(opt.value)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-medium transition disabled:pointer-events-none disabled:opacity-50",
                aspectRatio === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <QualityPicker
        quality={quality}
        onQualityChange={onQualityChange}
        disabled={disabled}
      />
    </div>
  );
}

/**
 * Yalnızca kalite seçici — Satış Seti gibi en-boy oranı sahne başına sabit olan
 * akışlarda RenderOptions'ın tamamı yerine tek başına kullanılır.
 */
export function QualityPicker({
  quality,
  onQualityChange,
  disabled,
}: {
  quality: RenderQuality;
  onQualityChange: (v: RenderQuality) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <span className="text-sm font-medium text-foreground">Kalite</span>
      <div
        role="radiogroup"
        aria-label="Render kalitesi"
        className="mt-2 flex flex-wrap gap-1.5"
      >
        {QUALITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={quality === opt.value}
            disabled={disabled}
            onClick={() => onQualityChange(opt.value)}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs font-medium transition disabled:pointer-events-none disabled:opacity-50",
              quality === opt.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Kredi maliyetine göre üret butonu metni — "Üret (1 kredi)" / "Üret (2 kredi)". */
export function renderButtonLabel(quality: RenderQuality): string {
  const cost = creditCostFor(quality);
  return `Üret (${cost} kredi)`;
}
