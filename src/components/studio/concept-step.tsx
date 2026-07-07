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

/* ─── Başlangıç paneli (AI konsept öner + hazır stüdyolar + özel prompt) ─── */
export function StartPanel({
  hasFile,
  analyzing,
  onAnalyze,
  onBrowseTemplates,
  onWritePrompt,
}: {
  hasFile: boolean;
  analyzing: boolean;
  onAnalyze: () => void;
  onBrowseTemplates?: () => void;
  onWritePrompt?: () => void;
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
      {(onBrowseTemplates || onWritePrompt) && (
        <>
          <div className="mx-auto my-4 flex w-full max-w-xs items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">veya</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="mx-auto flex flex-wrap justify-center gap-3">
            {onBrowseTemplates && (
              <Button
                onClick={onBrowseTemplates}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <ImageIcon className="size-4" />
                Hazır Stüdyoları Keşfet
              </Button>
            )}
            {onWritePrompt && (
              <Button
                onClick={onWritePrompt}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <PencilLine className="size-4" />
                Kendi Promptunu Yaz
              </Button>
            )}
          </div>
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

/* ─── Doğrudan özel prompt paneli (analiz gerektirmez) ─── */
export function CustomPromptPanel({
  customPrompt,
  hasFile,
  busy,
  generating,
  aspectRatio,
  onAspectRatioChange,
  quality,
  onQualityChange,
  onCustomChange,
  onGenerate,
  onBack,
}: {
  customPrompt: string;
  hasFile: boolean;
  busy: boolean;
  generating: boolean;
  aspectRatio: AspectRatioValue;
  onAspectRatioChange: (v: AspectRatioValue) => void;
  quality: RenderQuality;
  onQualityChange: (v: RenderQuality) => void;
  onCustomChange: (v: string) => void;
  onGenerate: () => void;
  onBack: () => void;
}) {
  const progressMessage = useProgressMessages(generating);
  const canGenerate = hasFile && customPrompt.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-medium">Kendi fikriniz</h3>
          <p className="text-sm text-muted-foreground">
            Hayalinizdeki sahneyi anlatın; ürününüz korunarak o sahneye taşınsın.
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

      <div className="space-y-1.5">
        <Label htmlFor="direct-custom-prompt" className="sr-only">
          Sahne açıklamanız
        </Label>
        <Textarea
          id="direct-custom-prompt"
          value={customPrompt}
          onChange={(e) => onCustomChange(e.target.value)}
          disabled={busy}
          rows={5}
          placeholder="Örn: Ürünü ıslak siyah taş üzerinde, tek bir dramatik tepe ışığıyla, lüks parfüm reklamı estetiğinde göster…"
        />
        <p className="text-xs text-muted-foreground">
          İpucu: zemin/materyal, ışık yönü, atmosfer ve kamera açısını
          belirtirseniz sonuç daha isabetli olur. Türkçe yazabilirsiniz.
        </p>
      </div>

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
      {!hasFile && (
        <p className="text-center text-xs text-muted-foreground">
          Önce soldan bir ürün görseli yükleyin.
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
