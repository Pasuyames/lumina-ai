"use client";

import { Sparkles, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";
import { ROUTES } from "@/lib/constants";

/* ─── SONUÇ EKRANI ─── */
export function ResultStep({
  result,
  balance,
  onReset,
}: {
  result: { url: string; id: string; sourceUrl?: string };
  balance: number;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <BeforeAfterSlider
        beforeSrc={result.sourceUrl}
        afterSrc={result.url}
        beforeAlt="Yüklenen ham ürün fotoğrafı"
        afterAlt="Üretilen stüdyo görseli"
      />
      <div className="flex flex-col justify-center gap-5">
        <div>
          <Badge className="gap-1.5">
            <Sparkles className="size-3.5" /> Üretim tamamlandı
          </Badge>
          <h2 className="font-heading mt-3 text-2xl font-semibold">
            Görseliniz hazır
          </h2>
          <p className="mt-1 text-muted-foreground">
            2K çözünürlükte indirin veya geçmişinizden tekrar erişin. Kalan
            krediniz: <strong>{balance}</strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={result.url}
            download
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
          >
            <Download className="size-4" /> 2K görseli indir
          </a>
          <ButtonLink
            href={`${ROUTES.generations}/${result.id}`}
            variant="outline"
          >
            Detayı gör
          </ButtonLink>
          <Button variant="ghost" onClick={onReset} className="gap-2">
            <RotateCcw className="size-4" /> Yeni üretim
          </Button>
        </div>
      </div>
    </div>
  );
}
