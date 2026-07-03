"use client";

import { Sparkles, Wand2, Loader2, ImageIcon, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConceptCard } from "@/components/studio/concept-card";
import {
  RenderOptions,
  renderButtonLabel,
  type AspectRatioValue,
} from "@/components/studio/render-options";
import { useProgressMessages } from "@/lib/hooks/use-progress-messages";
import type { Concept } from "@/lib/gemini/analyze";
import type { RenderQuality } from "@/lib/credits";

/* ─── Başlangıç paneli (AI konsept öner + hazır stüdyolar) ─── */
export function StartPanel({
  hasFile,
  analyzing,
  onAnalyze,
  onBrowseTemplates,
}: {
  hasFile: boolean;
  analyzing: boolean;
  onAnalyze: () => void;
  onBrowseTemplates?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
        <Wand2 className="size-6" />
      </span>
      <h3 className="font-heading mt-4 text-lg font-medium">
        Yapay zekâ konsept önersin
      </h3>
      <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">
        Görseli yükleyin; Gemini ürünü analiz edip size 3 lüks stüdyo konsepti
        sunsun. Bu adım ücretsizdir.
      </p>
      <Button
        onClick={onAnalyze}
        disabled={!hasFile || analyzing}
        className="mx-auto mt-6 gap-2"
        size="lg"
      >
        {analyzing ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {analyzing ? "Analiz ediliyor…" : "AI Konsept Öner"}
      </Button>
      {onBrowseTemplates && (
        <>
          <div className="mx-auto my-4 flex w-full max-w-xs items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">veya</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            onClick={onBrowseTemplates}
            variant="outline"
            className="mx-auto gap-2"
            size="lg"
          >
            <ImageIcon className="size-4" />
            Hazır Stüdyoları Keşfet
          </Button>
        </>
      )}
      {!hasFile && (
        <p className="mt-3 text-xs text-muted-foreground">
          Önce soldan bir görsel yükleyin.
        </p>
      )}
    </div>
  );
}

/* ─── Konsept seçim paneli ─── */
export function ConceptPanel({
  concepts,
  selectedPrompt,
  usingCustom,
  customPrompt,
  busy,
  generating,
  aspectRatio,
  onAspectRatioChange,
  quality,
  onQualityChange,
  onSelectConcept,
  onUseCustom,
  onCustomChange,
  onGenerate,
}: {
  concepts: Concept[];
  selectedPrompt: string | null;
  usingCustom: boolean;
  customPrompt: string;
  busy: boolean;
  generating: boolean;
  aspectRatio: AspectRatioValue;
  onAspectRatioChange: (v: AspectRatioValue) => void;
  quality: RenderQuality;
  onQualityChange: (v: RenderQuality) => void;
  onSelectConcept: (c: Concept) => void;
  onUseCustom: () => void;
  onCustomChange: (v: string) => void;
  onGenerate: () => void;
}) {
  const canGenerate = usingCustom
    ? customPrompt.trim().length > 0
    : !!selectedPrompt;
  const progressMessage = useProgressMessages(generating);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading text-lg font-medium">Bir konsept seçin</h3>
        <p className="text-sm text-muted-foreground">
          Yapay zekânın önerdiği stüdyo sahnelerinden birini seçin.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {concepts.map((c, i) => (
          <ConceptCard
            key={i}
            concept={c}
            selected={!usingCustom && selectedPrompt === c.prompt}
            onSelect={() => onSelectConcept(c)}
            disabled={busy}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onUseCustom}
        disabled={busy}
        className={`flex w-full items-center gap-2 rounded-xl border p-3 text-left text-sm transition ${
          usingCustom
            ? "border-primary bg-accent/40"
            : "border-border hover:border-primary/40"
        }`}
      >
        <PencilLine className="size-4 text-primary" />
        Kendi fikrimi yazmak istiyorum
      </button>

      {usingCustom && (
        <div className="space-y-1.5">
          <Label htmlFor="custom-prompt" className="sr-only">
            Kendi konsept fikriniz
          </Label>
          <Textarea
            id="custom-prompt"
            value={customPrompt}
            onChange={(e) => onCustomChange(e.target.value)}
            disabled={busy}
            rows={3}
            placeholder="Örn: Ürünü ıslak siyah taş üzerinde, tek bir dramatik tepe ışığıyla, lüks parfüm reklamı estetiğinde göster…"
          />
        </div>
      )}

      <RenderOptions
        aspectRatio={aspectRatio}
        onAspectRatioChange={onAspectRatioChange}
        quality={quality}
        onQualityChange={onQualityChange}
        disabled={busy}
      />

      <Button
        onClick={onGenerate}
        disabled={!canGenerate || busy}
        size="lg"
        className="w-full gap-2"
      >
        {generating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImageIcon className="size-4" />
        )}
        {generating ? progressMessage : renderButtonLabel(quality)}
      </Button>
    </div>
  );
}
