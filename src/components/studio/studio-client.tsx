"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UploadStep } from "@/components/studio/upload-step";
import {
  StartPanel,
  ConceptPanel,
  CustomPromptPanel,
} from "@/components/studio/concept-step";
import { TemplatePanel } from "@/components/studio/render-step";
import { TemplateGallery } from "@/components/studio/template-gallery";
import { ResultStep } from "@/components/studio/result-step";
import { SalesSetPanel } from "@/components/studio/sales-set-panel";
import { SalesSetResult } from "@/components/studio/sales-set-result";
import type { AspectRatioValue } from "@/components/studio/render-options";
import type { StudioTemplate } from "@/lib/templates";
import type { RenderQuality } from "@/lib/credits";
import { useStudioGeneration } from "@/hooks/use-studio-generation";

export function StudioClient({
  initialBalance,
  initialTemplate,
}: {
  initialBalance: number;
  initialTemplate: StudioTemplate | null;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [template, setTemplate] = useState<StudioTemplate | null>(
    initialTemplate,
  );
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [usingCustom, setUsingCustom] = useState(false);
  const [browsingTemplates, setBrowsingTemplates] = useState(false);
  const [writingPrompt, setWritingPrompt] = useState(false);
  const [browsingSalesSet, setBrowsingSalesSet] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>("4:5");
  const [quality, setQuality] = useState<RenderQuality>("2K");

  const {
    status,
    result,
    concepts,
    salesSetResult,
    balance,
    busy,
    runGenerate,
    runGenerateSalesSet,
    runGenerateCreative,
    handleAnalyze,
    resetResults,
    clearSalesSetResult,
  } = useStudioGeneration({
    file,
    category,
    setCategory,
    quality,
    aspectRatio,
    initialBalance,
  });

  function resetDownstream() {
    resetResults();
    setSelectedPrompt(null);
    setSelectedTitle("");
    setUsingCustom(false);
    setCustomPrompt("");
    setWritingPrompt(false);
    setBrowsingSalesSet(false);
  }

  function handleSelect(f: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    resetDownstream();
  }

  function handleClear() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    resetDownstream();
  }

  function fullReset() {
    handleClear();
  }

  /** StartPanel + TemplatePanel'in "AI konsept önersin" tetikleyicileri —
   * şablon seçiliyse önce onu temizler, ardından hook'un analizini başlatır. */
  function handleAnalyzeClick() {
    setTemplate(null);
    handleAnalyze();
  }

  function handleGenerateSelected() {
    const prompt = usingCustom ? customPrompt.trim() : selectedPrompt;
    const title = usingCustom ? "Özel konsept" : selectedTitle;
    if (!prompt) {
      toast.error("Lütfen bir konsept seçin veya kendi promptunuzu yazın.");
      return;
    }
    runGenerate(prompt, title);
  }

  // ── SONUÇ EKRANI ──
  if (salesSetResult) {
    return (
      <SalesSetResult
        results={salesSetResult.results}
        balance={salesSetResult.balance}
        onReset={fullReset}
        onBackToStudio={() => {
          clearSalesSetResult();
          setBrowsingSalesSet(false);
        }}
      />
    );
  }
  if (result) {
    return <ResultStep result={result} balance={balance} onReset={fullReset} />;
  }

  // ── ÇALIŞMA EKRANI ──
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* SOL: yükleme + kategori */}
      <UploadStep
        previewUrl={previewUrl}
        onSelect={handleSelect}
        onClear={handleClear}
        category={category}
        onCategoryChange={setCategory}
        disabled={busy}
      />

      {/* SAĞ: akışa göre değişen panel */}
      <div className="flex flex-col">
        {concepts ? (
          <ConceptPanel
            concepts={concepts}
            selectedPrompt={selectedPrompt}
            usingCustom={usingCustom}
            customPrompt={customPrompt}
            busy={busy}
            generating={status === "generating"}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            quality={quality}
            onQualityChange={setQuality}
            onSelectConcept={(c) => {
              setSelectedPrompt(c.prompt);
              setSelectedTitle(c.title);
              setUsingCustom(false);
            }}
            onUseCustom={() => {
              setUsingCustom(true);
              setSelectedPrompt(null);
            }}
            onCustomChange={setCustomPrompt}
            onGenerate={handleGenerateSelected}
          />
        ) : template ? (
          <TemplatePanel
            template={template}
            hasFile={!!file}
            busy={busy}
            generating={status === "generating"}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            quality={quality}
            onQualityChange={setQuality}
            onGenerate={() =>
              runGenerate(template.prompt, template.title, template.id)
            }
            onSwitchToAi={handleAnalyzeClick}
          />
        ) : writingPrompt ? (
          <CustomPromptPanel
            customPrompt={customPrompt}
            hasFile={!!file}
            busy={busy}
            generating={status === "generating"}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            quality={quality}
            onQualityChange={setQuality}
            onCustomChange={setCustomPrompt}
            onGenerate={() => {
              const p = customPrompt.trim();
              if (!p) {
                toast.error("Lütfen sahnenizi birkaç cümleyle anlatın.");
                return;
              }
              runGenerate(p, "Özel konsept");
            }}
            onBack={() => setWritingPrompt(false)}
          />
        ) : browsingTemplates ? (
          <div className="flex-1 overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-medium">
                Hazır Stüdyolar
              </h3>
              <button
                type="button"
                onClick={() => setBrowsingTemplates(false)}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Geri
              </button>
            </div>
            <TemplateGallery
              onSelect={(t) => {
                setTemplate(t);
                setBrowsingTemplates(false);
              }}
            />
          </div>
        ) : browsingSalesSet ? (
          <SalesSetPanel
            hasFile={!!file}
            busy={busy}
            generating={status === "generating"}
            quality={quality}
            onQualityChange={setQuality}
            onGenerate={runGenerateSalesSet}
            onBack={() => setBrowsingSalesSet(false)}
          />
        ) : (
          <StartPanel
            hasFile={!!file}
            analyzing={status === "analyzing"}
            creativeLoading={status === "generating"}
            onAnalyze={handleAnalyzeClick}
            onBrowseTemplates={() => setBrowsingTemplates(true)}
            onWritePrompt={() => setWritingPrompt(true)}
            onSalesSet={() => setBrowsingSalesSet(true)}
            onCreative={runGenerateCreative}
          />
        )}
      </div>
    </div>
  );
}
