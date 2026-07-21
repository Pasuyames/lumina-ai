"use client";

import { Package, UserRound, ZoomIn, Camera, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QualityPicker } from "@/components/studio/render-options";
import {
  useProgressMessages,
  SALES_SET_PROGRESS_MESSAGES,
} from "@/lib/hooks/use-progress-messages";
import {
  SALES_SET_SHOT_TYPES,
  SHOT_FALLBACK_TITLES,
  SHOT_DESCRIPTIONS,
  type SalesShotType,
} from "@/lib/sales-set-shots";
import { salesSetCreditCost, creditCostFor, type RenderQuality } from "@/lib/credits";

const SHOT_ICONS: Record<SalesShotType, typeof Package> = {
  packshot: Package,
  context: UserRound,
  detail: ZoomIn,
  hero: Camera,
};

/* ─── Satış Seti paneli — 4 karenin ne olduğunu anlatır, kaliteyi seçtirir, üretimi başlatır ─── */
export function SalesSetPanel({
  hasFile,
  busy,
  generating,
  quality,
  onQualityChange,
  onGenerate,
  onBack,
}: {
  hasFile: boolean;
  busy: boolean;
  generating: boolean;
  quality: RenderQuality;
  onQualityChange: (v: RenderQuality) => void;
  onGenerate: () => void;
  onBack: () => void;
}) {
  const progressMessage = useProgressMessages(
    generating,
    SALES_SET_PROGRESS_MESSAGES,
  );
  const totalCost = salesSetCreditCost(quality);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading flex items-center gap-2 text-lg font-medium">
            <ShoppingBag className="size-5 text-primary" /> Satış Seti
          </h3>
          <p className="text-sm text-muted-foreground">
            Tek üründen 4 karelik eksiksiz e-ticaret listeleme seti üretilir.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Geri
        </button>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {SALES_SET_SHOT_TYPES.map((type) => {
          const Icon = SHOT_ICONS[type];
          return (
            <li
              key={type}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card/50 p-3"
            >
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {SHOT_FALLBACK_TITLES[type]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {SHOT_DESCRIPTIONS[type]}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <QualityPicker
        quality={quality}
        onQualityChange={onQualityChange}
        disabled={busy}
      />

      <p className="text-sm text-muted-foreground">
        4 görsel ={" "}
        <strong className="text-foreground">
          {salesSetCreditCost("2K")} kredi (2K)
        </strong>{" "}
        /{" "}
        <strong className="text-foreground">
          {salesSetCreditCost("4K")} kredi (4K)
        </strong>
        {quality === "4K" && (
          <> — bu üretimde {totalCost} kredi kullanılacak.</>
        )}
      </p>

      <Button
        onClick={onGenerate}
        disabled={!hasFile || busy}
        size="lg"
        className="w-full gap-2"
      >
        {generating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ShoppingBag className="size-4" />
        )}
        {generating
          ? progressMessage
          : `Satış Setini Üret (${totalCost} kredi, ${creditCostFor(quality)}/kare)`}
      </Button>
      {!hasFile && (
        <p className="text-center text-xs text-muted-foreground">
          Önce soldan bir ürün görseli yükleyin.
        </p>
      )}
    </div>
  );
}
