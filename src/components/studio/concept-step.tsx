"use client";

import { Sparkles, Wand2, Loader2, ImageIcon, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConceptCard } from "@/components/studio/concept-card";
import type { Concept } from "@/lib/gemini/analyze";

/* ─── Başlangıç paneli (AI konsept öner) ─── */
export function StartPanel({
  hasFile,
  analyzing,
  onAnalyze,
}: {
  hasFile: boolean;
  analyzing: boolean;
  onAnalyze: () => void;
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
  onSelectConcept: (c: Concept) => void;
  onUseCustom: () => void;
  onCustomChange: (v: string) => void;
  onGenerate: () => void;
}) {
  const canGenerate = usingCustom
    ? customPrompt.trim().length > 0
    : !!selectedPrompt;

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
        {generating ? "Üretiliyor… (~10-20 sn)" : "Görseli Üret · 1 kredi"}
      </Button>
    </div>
  );
}
