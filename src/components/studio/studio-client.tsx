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
import { RecentGenerationsStrip } from "@/components/studio/recent-generations-strip";
import type { AspectRatioValue } from "@/components/studio/render-options";
import type { StudioTemplate } from "@/lib/templates";
import type { RenderQuality } from "@/lib/credits";
import { MAX_ADDITIONAL_ANGLES } from "@/lib/constants";
import { useStudioGeneration } from "@/hooks/use-studio-generation";

export function StudioClient({
  initialBalance,
  initialTemplate,
  recentGenerations = [],
}: {
  initialBalance: number;
  initialTemplate: StudioTemplate | null;
  recentGenerations?: { id: string; title: string | null; imageUrl: string }[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviewUrls, setAdditionalPreviewUrls] = useState<string[]>(
    [],
  );
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
    regeneratingType,
    balance,
    busy,
    runGenerate,
    runGenerateSalesSet,
    runRegenerateSalesSetShot,
    runGenerateCreative,
    handleAnalyze,
    resetResults,
    clearSalesSetResult,
  } = useStudioGeneration({
    file,
    additionalFiles,
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
    // Ek açılar aynı ürün yüklemesine ait — ana görsel tamamen kaldırılınca
    // (resetDownstream'in aksine, o sadece konsept/şablon/custom paneli
    // değiştirir) onlar da temizlenir.
    additionalPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setAdditionalFiles([]);
    setAdditionalPreviewUrls([]);
    resetDownstream();
  }

  function fullReset() {
    handleClear();
  }

  function handleAddAdditional(f: File) {
    if (additionalFiles.length >= MAX_ADDITIONAL_ANGLES) return;
    setAdditionalFiles((prev) => [...prev, f]);
    setAdditionalPreviewUrls((prev) => [...prev, URL.createObjectURL(f)]);
  }

  function handleRemoveAdditional(index: number) {
    setAdditionalPreviewUrls((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
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
    // usingCustom=true → kullanıcı kendi ham metnini yazdı, ürüne özel
    // zenginleştirme gerekir ("custom"). usingCustom=false → kullanıcı 3
    // AI-konseptinden birini seçti, bu zaten analyzeProduct() ile ürüne özel
    // üretilmiş — yeniden zenginleştirme çifte Vision maliyeti olur ("concept").
    runGenerate(prompt, title, undefined, usingCustom ? "custom" : "concept");
  }

  // ── SONUÇ EKRANI ──
  if (salesSetResult) {
    return (
      <SalesSetResult
        results={salesSetResult.results}
        balance={balance}
        quality={quality}
        regeneratingType={regeneratingType}
        onRegenerate={runRegenerateSalesSetShot}
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
  const showingStartPanel =
    !concepts &&
    !template &&
    !writingPrompt &&
    !browsingTemplates &&
    !browsingSalesSet;

  return (
    <div>
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-y-4">
      {/* SOL: yükleme + kategori (lg'de `contents` ile ızgaraya açılır) */}
      <UploadStep
        previewUrl={previewUrl}
        onSelect={handleSelect}
        onClear={handleClear}
        category={category}
        onCategoryChange={setCategory}
        disabled={busy}
        additionalPreviewUrls={additionalPreviewUrls}
        onAddAdditional={handleAddAdditional}
        onRemoveAdditional={handleRemoveAdditional}
      />

      {/* SAĞ: akışa göre değişen panel — her zaman 1. satırda, yükleme
          alanının tam karşısında durur ve onunla aynı hizada biter. */}
      <div className="flex flex-col lg:col-start-2 lg:row-start-1">
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
              runGenerate(
                template.prompt,
                template.title,
                template.id,
                "template",
              )
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
              runGenerate(p, "Özel konsept", undefined, "custom");
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
    {showingStartPanel && (
      <RecentGenerationsStrip items={recentGenerations} />
    )}
    </div>
  );
}
