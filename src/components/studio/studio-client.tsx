"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { ROUTES } from "@/lib/constants";
import type { StudioTemplate } from "@/lib/templates";
import type { Concept } from "@/lib/gemini/analyze";
import { creditCostFor, salesSetCreditCost, type RenderQuality } from "@/lib/credits";
import {
  analyzeProductAction,
  uploadSourceAction,
  generateImageAction,
  generateSalesSetAction,
  generateCreativeAction,
  type SalesSetShotResult,
} from "@/app/(app)/studio/actions";

type Source = { sourcePath: string; sourceUrl: string; mimeType: string };
type Status = "idle" | "analyzing" | "generating";

export function StudioClient({
  initialBalance,
  initialTemplate,
}: {
  initialBalance: number;
  initialTemplate: StudioTemplate | null;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [balance, setBalance] = useState(initialBalance);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [template, setTemplate] = useState<StudioTemplate | null>(
    initialTemplate,
  );
  const [source, setSource] = useState<Source | null>(null);
  const [concepts, setConcepts] = useState<Concept[] | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [usingCustom, setUsingCustom] = useState(false);
  const [browsingTemplates, setBrowsingTemplates] = useState(false);
  const [writingPrompt, setWritingPrompt] = useState(false);
  const [browsingSalesSet, setBrowsingSalesSet] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>("4:5");
  const [quality, setQuality] = useState<RenderQuality>("2K");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<
    { url: string; id: string; sourceUrl: string } | null
  >(null);
  const [salesSetResult, setSalesSetResult] = useState<{
    results: SalesSetShotResult[];
    balance: number;
  } | null>(null);

  const busy = status !== "idle";

  function resetDownstream() {
    setSource(null);
    setConcepts(null);
    setSelectedPrompt(null);
    setSelectedTitle("");
    setUsingCustom(false);
    setCustomPrompt("");
    setWritingPrompt(false);
    setBrowsingSalesSet(false);
    setResult(null);
    setSalesSetResult(null);
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
    setStatus("idle");
  }

  // ── Aşama 1: AI konsept önerisi ──
  function handleAnalyze() {
    if (!file) return;
    setTemplate(null);
    setStatus("analyzing");
    startTransition(async () => {
      const fd = new FormData();
      fd.set("image", file);
      fd.set("category", category);
      const res = await analyzeProductAction(fd);
      if (!res.ok) {
        toast.error(res.error);
        setStatus("idle");
        return;
      }
      setSource({
        sourcePath: res.sourcePath,
        sourceUrl: res.sourceUrl,
        mimeType: res.mimeType,
      });
      setConcepts(res.analysis.concepts);
      if (!category && res.analysis.category) setCategory(res.analysis.category);
      setStatus("idle");
      toast.success("3 konsept hazır — birini seçin.");
    });
  }

  // ── Aşama 2: Render ──
  function runGenerate(prompt: string, title: string, templateId?: string) {
    if (!file) {
      toast.error("Önce bir ürün görseli yükleyin.");
      return;
    }
    const creditCost = creditCostFor(quality);
    if (balance < creditCost) {
      toast.error("Krediniz yetersiz. Paket satın alın.");
      router.push(ROUTES.billing);
      return;
    }
    setStatus("generating");
    startTransition(async () => {
      try {
        // Kaynak henüz yüklenmediyse (şablon akışı) önce yükle.
        let src = source;
        if (!src) {
          const fd = new FormData();
          fd.set("image", file);
          const up = await uploadSourceAction(fd);
          if (!up.ok) {
            toast.error(up.error);
            setStatus("idle");
            return;
          }
          src = {
            sourcePath: up.sourcePath,
            sourceUrl: up.sourceUrl,
            mimeType: up.mimeType,
          };
          setSource(src);
        }

        const res = await generateImageAction({
          sourcePath: src.sourcePath,
          mimeType: src.mimeType,
          prompt,
          conceptTitle: title,
          category: category || undefined,
          templateId,
          aspectRatio,
          quality,
        });

        if (!res.ok) {
          toast.error(res.error);
          if (res.needCredits) router.push(ROUTES.billing);
          setStatus("idle");
          return;
        }

        setResult({
          url: res.resultUrl,
          id: res.generationId,
          sourceUrl: src.sourceUrl,
        });
        setBalance(res.balance);
        setStatus("idle");
        toast.success(
          `Görseliniz hazır! ${creditCost} kredi kullanıldı.`,
        );
      } catch {
        toast.error("Beklenmeyen bir hata oluştu.");
        setStatus("idle");
      }
    });
  }

  // ── Satış Seti: tek üründen 4 karelik e-ticaret listeleme seti ──
  function runGenerateSalesSet() {
    if (!file) {
      toast.error("Önce bir ürün görseli yükleyin.");
      return;
    }
    const cost = salesSetCreditCost(quality);
    if (balance < cost) {
      toast.error("Krediniz yetersiz. Paket satın alın.");
      router.push(ROUTES.billing);
      return;
    }
    setStatus("generating");
    startTransition(async () => {
      try {
        // Kaynak henüz yüklenmediyse önce yükle (StartPanel'den doğrudan gelinebilir).
        let src = source;
        if (!src) {
          const fd = new FormData();
          fd.set("image", file);
          const up = await uploadSourceAction(fd);
          if (!up.ok) {
            toast.error(up.error);
            setStatus("idle");
            return;
          }
          src = {
            sourcePath: up.sourcePath,
            sourceUrl: up.sourceUrl,
            mimeType: up.mimeType,
          };
          setSource(src);
        }

        const res = await generateSalesSetAction({
          sourcePath: src.sourcePath,
          mimeType: src.mimeType,
          category: category || undefined,
          quality,
        });

        if (!res.ok) {
          toast.error(res.error);
          if (res.needCredits) router.push(ROUTES.billing);
          setStatus("idle");
          return;
        }

        setSalesSetResult({ results: res.results, balance: res.balance });
        setBalance(res.balance);
        setStatus("idle");
        const successCount = res.results.filter(
          (r) => r.status === "completed",
        ).length;
        toast.success(
          `Satış Seti hazır! ${successCount}/4 kare üretildi, ${res.spentCredits} kredi kullanıldı.`,
        );
      } catch {
        toast.error("Beklenmeyen bir hata oluştu.");
        setStatus("idle");
      }
    });
  }

  // ── Kreatif Üret: tek tık — Vision cüretkar TEK sahne tasarlar, doğrudan render eder ──
  function runGenerateCreative() {
    if (!file) {
      toast.error("Önce bir ürün görseli yükleyin.");
      return;
    }
    const creditCost = creditCostFor(quality);
    if (balance < creditCost) {
      toast.error("Krediniz yetersiz. Paket satın alın.");
      router.push(ROUTES.billing);
      return;
    }
    setStatus("generating");
    startTransition(async () => {
      try {
        let src = source;
        if (!src) {
          const fd = new FormData();
          fd.set("image", file);
          const up = await uploadSourceAction(fd);
          if (!up.ok) {
            toast.error(up.error);
            setStatus("idle");
            return;
          }
          src = {
            sourcePath: up.sourcePath,
            sourceUrl: up.sourceUrl,
            mimeType: up.mimeType,
          };
          setSource(src);
        }

        const res = await generateCreativeAction({
          sourcePath: src.sourcePath,
          mimeType: src.mimeType,
          category: category || undefined,
          aspectRatio,
          quality,
        });

        if (!res.ok) {
          toast.error(res.error);
          if (res.needCredits) router.push(ROUTES.billing);
          setStatus("idle");
          return;
        }

        setResult({
          url: res.resultUrl,
          id: res.generationId,
          sourceUrl: src.sourceUrl,
        });
        setBalance(res.balance);
        setStatus("idle");
        toast.success(`"${res.title}" hazır! ${creditCost} kredi kullanıldı.`);
      } catch {
        toast.error("Beklenmeyen bir hata oluştu.");
        setStatus("idle");
      }
    });
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
          setSalesSetResult(null);
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
            onSwitchToAi={handleAnalyze}
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
            onAnalyze={handleAnalyze}
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
