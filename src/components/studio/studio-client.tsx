"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  Wand2,
  Loader2,
  Download,
  RotateCcw,
  ImageIcon,
  PencilLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ImageDropzone } from "@/components/studio/image-dropzone";
import { ConceptCard } from "@/components/studio/concept-card";
import { PRODUCT_CATEGORIES, ROUTES } from "@/lib/constants";
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
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.url}
            alt="Üretilen görsel"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
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
            <Button variant="ghost" onClick={fullReset} className="gap-2">
              <RotateCcw className="size-4" /> Yeni üretim
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── ÇALIŞMA EKRANI ──
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* SOL: yükleme + kategori */}
      <div className="space-y-4">
        <ImageDropzone
          previewUrl={previewUrl}
          onSelect={handleSelect}
          onClear={handleClear}
          disabled={busy}
        />
        <div className="space-y-1.5">
          <Label htmlFor="category">Kategori (opsiyonel)</Label>
          <select
            id="category"
            value={category}
            disabled={busy}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
          >
            <option value="">Otomatik algıla</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

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

/* ─── Başlangıç paneli (AI konsept öner) ─── */
function StartPanel({
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
function ConceptPanel({
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
        <Textarea
          value={customPrompt}
          onChange={(e) => onCustomChange(e.target.value)}
          disabled={busy}
          rows={3}
          placeholder="Örn: Ürünü ıslak siyah taş üzerinde, tek bir dramatik tepe ışığıyla, lüks parfüm reklamı estetiğinde göster…"
        />
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

/* ─── Hazır Stüdyo paneli ─── */
function TemplatePanel({
  template,
  hasFile,
  busy,
  generating,
  onGenerate,
  onSwitchToAi,
}: {
  template: StudioTemplate;
  hasFile: boolean;
  busy: boolean;
  generating: boolean;
  onGenerate: () => void;
  onSwitchToAi: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center space-y-4 rounded-2xl border border-border bg-card/50 p-6">
      <Badge variant="secondary" className="w-fit gap-1.5">
        <Sparkles className="size-3.5 text-primary" /> Hazır Stüdyo
      </Badge>
      <div>
        <h3 className="font-heading text-xl font-medium">{template.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {template.description}
        </p>
      </div>
      <Button
        onClick={onGenerate}
        disabled={!hasFile || busy}
        size="lg"
        className="w-full gap-2"
      >
        {generating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImageIcon className="size-4" />
        )}
        {generating ? "Üretiliyor… (~10-20 sn)" : "Bu stüdyoyla üret · 1 kredi"}
      </Button>
      <button
        type="button"
        onClick={onSwitchToAi}
        disabled={!hasFile || busy}
        className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-60"
      >
        veya yapay zekâ bana konsept önersin
      </button>
      {!hasFile && (
        <p className="text-center text-xs text-muted-foreground">
          Önce soldan bir görsel yükleyin.
        </p>
      )}
    </div>
  );
}
