"use client";

import Image from "next/image";
import { Download, RotateCcw, ShoppingBag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SalesSetShotResult } from "@/app/(app)/studio/actions";

/* ─── Satış Seti sonuç ekranı — 2x2 grid, başarısız kareler zarif hata kartıyla ─── */
export function SalesSetResult({
  results,
  balance,
  onReset,
  onBackToStudio,
}: {
  results: SalesSetShotResult[];
  balance: number;
  onReset: () => void;
  onBackToStudio: () => void;
}) {
  const successCount = results.filter((r) => r.status === "completed").length;

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
        {results.map((r) => (
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
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="text-sm font-medium text-foreground">
                    {r.title}
                  </span>
                  <a
                    href={r.resultUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <Download className="size-3.5" /> İndir
                  </a>
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
        ))}
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
