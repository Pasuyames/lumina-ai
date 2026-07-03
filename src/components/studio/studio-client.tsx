"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadStep } from "@/components/studio/upload-step";
import { StartPanel, ConceptPanel } from "@/components/studio/concept-step";
import { TemplatePanel } from "@/components/studio/render-step";
import { ResultStep } from "@/components/studio/result-step";
import { ROUTES } from "@/lib/constants";
import type { StudioTemplate } from "@/lib/templates";
import type { Concept } from "@/lib/gemini/analyze";
import {
  analyzeProductAction,
  uploadSourceAction,
  generateImageAction,
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
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<{ url: string; id: string } | null>(
    null,
  );

  const busy = status !== "idle";

  function resetDownstream() {
    setSource(null);
    setConcepts(null);
    setSelectedPrompt(null);
    setSelectedTitle("");
    setUsingCustom(false);
    setCustomPrompt("");
    setResult(null);
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
    if (balance < 1) {
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
          aspectRatio: "4:5",
        });

        if (!res.ok) {
          toast.error(res.error);
          if (res.needCredits) router.push(ROUTES.billing);
          setStatus("idle");
          return;
        }

        setResult({ url: res.resultUrl, id: res.generationId });
        setBalance(res.balance);
        setStatus("idle");
        toast.success("Görseliniz hazır! 1 kredi kullanıldı.");
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
            onGenerate={() =>
              runGenerate(template.prompt, template.title, template.id)
            }
            onSwitchToAi={handleAnalyze}
          />
        ) : (
          <StartPanel
            hasFile={!!file}
            analyzing={status === "analyzing"}
            onAnalyze={handleAnalyze}
          />
        )}
      </div>
    </div>
  );
}
