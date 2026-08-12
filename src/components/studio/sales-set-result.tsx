"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Download,
  RotateCcw,
  ShoppingBag,
  AlertTriangle,
  Loader2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { creditCostFor, type RenderQuality } from "@/lib/credits";
import type { SalesShotType } from "@/lib/sales-set-shots";
import type { SalesSetShotResult } from "@/app/(app)/studio/actions";

/* ─── Satış Seti sonuç ekranı — 2x2 grid, başarısız kareler zarif hata kartıyla ─── */
export function SalesSetResult({
  results,
  balance,
  quality,
  regeneratingType,
  onRegenerate,
  onReset,
  onBackToStudio,
}: {
  results: SalesSetShotResult[];
  balance: number;
  quality: RenderQuality;
  /** Şu an yeniden üretilmekte olan kare türü — sadece o kartta spinner gösterilir. */
  regeneratingType: SalesShotType | null;
  onRegenerate: (type: SalesShotType, brief?: string) => void;
  onReset: () => void;
  onBackToStudio: () => void;
}) {
  const successCount = results.filter((r) => r.status === "completed").length;
  const regenerateCost = creditCostFor(quality);
  const [expandedType, setExpandedType] = useState<SalesShotType | null>(null);
  const [briefDrafts, setBriefDrafts] = useState<
    Partial<Record<SalesShotType, string>>
  >({});

  function handleSubmit(type: SalesShotType) {
    const brief = briefDrafts[type]?.trim() || undefined;
    onRegenerate(type, brief);
    setExpandedType(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge className="gap-1.5">
          <ShoppingBag className="size-3.5" /> Satış Seti hazır
        </Badge>
        <h2 className="font-heading mt-3 text-2xl font-semibold">
          {successCount}/4 kare üretildi
        </h2>
        <p className="mt-1 text-muted-foreground">
          Kalan krediniz: <strong>{balance}</strong>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {results.map((r) => {
          const isRegenerating = regeneratingType === r.type;
          const isExpanded = expandedType === r.type;
          return (
            <div
              key={r.type}
              className="overflow-hidden rounded-2xl border border-border bg-card/50"
            >
              {r.status === "completed" && r.resultUrl ? (
                <>
                  <div className="relative aspect-square w-full bg-muted">
                    <Image
                      src={r.resultUrl}
                      alt={r.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    {isRegenerating && (
                      <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
                        <Loader2 className="size-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {r.title}
                      </span>
                      <div className="flex items-center gap-3">
                        <a
                          href={r.resultUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          <Download className="size-3.5" /> İndir
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedType(isExpanded ? null : r.type)
                          }
                          disabled={isRegenerating}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                          <RotateCcw className="size-3.5" /> Yeniden üret
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="space-y-2 rounded-xl border border-border bg-background/60 p-2.5">
                        <Textarea
                          value={briefDrafts[r.type] ?? ""}
                          onChange={(e) =>
                            setBriefDrafts((prev) => ({
                              ...prev,
                              [r.type]: e.target.value,
                            }))
                          }
                          disabled={isRegenerating}
                          rows={2}
                          placeholder="İsteğe bağlı talimat (boş bırakırsan yeni bir varyasyon üretilir)…"
                          className="text-sm"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedType(null)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Vazgeç
                          </button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmit(r.type)}
                            disabled={isRegenerating}
                            className="gap-1.5"
                          >
                            <Wand2 className="size-3.5" />
                            Üret ({regenerateCost} kredi)
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div
                  role="alert"
                  className="flex aspect-square flex-col items-center justify-center gap-2 p-6 text-center"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-destructive/10 text-destructive">
                    <AlertTriangle className="size-4" />
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {r.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.error ?? "Bu kare üretilemedi."}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={onReset} className="gap-2">
          <RotateCcw className="size-4" /> Yeni set
        </Button>
        <Button variant="outline" onClick={onBackToStudio}>
          Stüdyoya dön
        </Button>
      </div>
    </div>
  );
}
