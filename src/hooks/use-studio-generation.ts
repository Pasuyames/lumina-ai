"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AspectRatioValue } from "@/components/studio/render-options";
import { ROUTES } from "@/lib/constants";
import type { Concept } from "@/lib/gemini/analyze";
import {
  creditCostFor,
  salesSetCreditCost,
  type RenderQuality,
} from "@/lib/credits";
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

/**
 * `studio-client.tsx`'ten çıkarılan üretim mantığı: analiz, render, satış
 * seti ve kreatif üretim akışları + bunlara ait state. Panel geçişleri (hangi
 * form/adım gösteriliyor) gibi saf UI state'i BİLEREK burada değil,
 * `StudioClient` bileşeninde kalır — bu hook yalnızca sunucu action'larıyla
 * konuşan "üretim" tarafını kapsar. Davranış (toast metinleri, kredi kontrol
 * sırası, hata durumunda idle'a dönüş) `studio-client.tsx`'teki orijinal
 * koddan birebir taşındı.
 */
export function useStudioGeneration({
  file,
  category,
  setCategory,
  quality,
  aspectRatio,
  initialBalance,
}: {
  file: File | null;
  category: string;
  /** AI analizinin otomatik algıladığı kategoriyi geri yazmak için. */
  setCategory: (value: string) => void;
  quality: RenderQuality;
  aspectRatio: AspectRatioValue;
  initialBalance: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [balance, setBalance] = useState(initialBalance);
  const [source, setSource] = useState<Source | null>(null);
  const [concepts, setConcepts] = useState<Concept[] | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<
    { url: string; id: string; sourceUrl: string } | null
  >(null);
  const [salesSetResult, setSalesSetResult] = useState<{
    results: SalesSetShotResult[];
    balance: number;
  } | null>(null);

  const busy = status !== "idle";

  /** Üretimle ilgili tüm sonuç/ara state'i sıfırlar (yeni dosya seçilince vb.). */
  function resetResults() {
    setSource(null);
    setConcepts(null);
    setResult(null);
    setSalesSetResult(null);
    setStatus("idle");
  }

  /**
   * Sadece Satış Seti sonucunu temizler ("Stüdyoya dön" — `source` bilerek
   * dokunulmaz, zaten yüklenmiş kaynağın tekrar yüklenmesini önler; orijinal
   * `studio-client.tsx`'teki `setSalesSetResult(null)` çağrısıyla birebir aynı).
   */
  function clearSalesSetResult() {
    setSalesSetResult(null);
  }

  // ── Aşama 1: AI konsept önerisi ──
  function handleAnalyze() {
    if (!file) return;
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
  function runGenerate(
    prompt: string,
    title: string,
    templateId?: string,
    promptSource: "concept" | "template" | "custom" = "concept",
  ) {
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
          promptSource,
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

  return {
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
  };
}
