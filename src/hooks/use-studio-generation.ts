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
  regenerateSalesSetShotAction,
  generateCreativeAction,
  type SalesSetShotResult,
} from "@/app/(app)/studio/actions";
import type { SalesShotType } from "@/lib/sales-set-shots";

type Source = { sourcePath: string; sourceUrl: string; mimeType: string };
/**
 * Ek açı görselleri için önizleme URL'i gerekmiyor (UI'da ayrıca
 * gösterilmiyor, sadece action'lara girdi olarak geçiyor) — bu yüzden
 * `Source`'tan farklı, daha dar bir şekil.
 */
type AdditionalSource = { sourcePath: string; mimeType: string };
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
  additionalFiles,
  category,
  setCategory,
  quality,
  aspectRatio,
  initialBalance,
}: {
  file: File | null;
  /** Ana görsele ek olarak yüklenmiş açı fotoğrafları (opsiyonel, max MAX_ADDITIONAL_ANGLES). */
  additionalFiles: File[];
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
  const [additionalSources, setAdditionalSources] = useState<AdditionalSource[]>([]);
  const [concepts, setConcepts] = useState<Concept[] | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<
    { url: string; id: string; sourceUrl: string } | null
  >(null);
  const [salesSetResult, setSalesSetResult] = useState<{
    setId: string;
    results: SalesSetShotResult[];
    balance: number;
  } | null>(null);
  /** Şu an tekil olarak yeniden üretilmekte olan kare — sadece o kartın
   * spinner'ı döner, diğer kareler etkileşilebilir kalır. */
  const [regeneratingType, setRegeneratingType] = useState<SalesShotType | null>(
    null,
  );

  const busy = status !== "idle";

  /** Üretimle ilgili tüm sonuç/ara state'i sıfırlar (yeni dosya seçilince vb.). */
  function resetResults() {
    setSource(null);
    setAdditionalSources([]);
    setConcepts(null);
    setResult(null);
    setSalesSetResult(null);
    setStatus("idle");
  }

  /**
   * Kaynak görsel (ve varsa ek açı görselleri) henüz yüklenmediyse yükler —
   * 3 `run*` fonksiyonunda (`runGenerate`, `runGenerateSalesSet`,
   * `runGenerateCreative`) tekrarlanan "yoksa yükle" bloğunun tek yerde
   * toplanmış hali. Hata durumunda toast gösterip status'u idle'a çeker ve
   * null döner — çağıran taraf bu durumda erken çıkmalı.
   */
  async function ensureSourceUploaded(): Promise<{
    src: Source;
    additional: AdditionalSource[];
  } | null> {
    let src = source;
    if (!src) {
      const fd = new FormData();
      fd.set("image", file!);
      const up = await uploadSourceAction(fd);
      if (!up.ok) {
        toast.error(up.error);
        setStatus("idle");
        return null;
      }
      src = { sourcePath: up.sourcePath, sourceUrl: up.sourceUrl, mimeType: up.mimeType };
      setSource(src);
    }
    let additional = additionalSources;
    if (additional.length === 0 && additionalFiles.length > 0) {
      const uploaded: AdditionalSource[] = [];
      for (const f of additionalFiles) {
        const fd = new FormData();
        fd.set("image", f);
        const up = await uploadSourceAction(fd);
        if (!up.ok) {
          toast.error(up.error);
          setStatus("idle");
          return null;
        }
        uploaded.push({ sourcePath: up.sourcePath, mimeType: up.mimeType });
      }
      additional = uploaded;
      setAdditionalSources(uploaded);
    }
    return { src, additional };
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
      for (const f of additionalFiles) fd.append("additionalImages", f);
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
      setAdditionalSources(res.additionalSources ?? []);
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
        // Kaynak (ve varsa ek açı görselleri) henüz yüklenmediyse (şablon akışı) önce yükle.
        const uploaded = await ensureSourceUploaded();
        if (!uploaded) return;
        const { src, additional } = uploaded;

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
          additionalSources: additional,
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
        // Kaynak (ve varsa ek açı görselleri) henüz yüklenmediyse önce yükle
        // (StartPanel'den doğrudan gelinebilir).
        const uploaded = await ensureSourceUploaded();
        if (!uploaded) return;
        const { src, additional } = uploaded;

        const res = await generateSalesSetAction({
          sourcePath: src.sourcePath,
          mimeType: src.mimeType,
          category: category || undefined,
          quality,
          additionalSources: additional,
        });

        if (!res.ok) {
          toast.error(res.error);
          if (res.needCredits) router.push(ROUTES.billing);
          setStatus("idle");
          return;
        }

        setSalesSetResult({
          setId: res.setId,
          results: res.results,
          balance: res.balance,
        });
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

  // ── Satış Seti: TEK kareyi (isteğe bağlı kendi briefiyle) yeniden üret —
  // diğer 3 kareye dokunmadan, sadece o karenin kredisi kadar harcar. ──
  function runRegenerateSalesSetShot(shotType: SalesShotType, brief?: string) {
    if (!source || !salesSetResult) return;
    const cost = creditCostFor(quality);
    if (balance < cost) {
      toast.error("Krediniz yetersiz. Paket satın alın.");
      router.push(ROUTES.billing);
      return;
    }
    setRegeneratingType(shotType);
    startTransition(async () => {
      try {
        const res = await regenerateSalesSetShotAction({
          sourcePath: source.sourcePath,
          mimeType: source.mimeType,
          setId: salesSetResult.setId,
          shotType,
          category: category || undefined,
          quality,
          brief,
          additionalSources,
        });

        if (!res.ok) {
          toast.error(res.error);
          if (res.needCredits) router.push(ROUTES.billing);
          setRegeneratingType(null);
          return;
        }

        setSalesSetResult((prev) =>
          prev
            ? {
                ...prev,
                results: prev.results.map((r) =>
                  r.type === shotType ? res.result : r,
                ),
              }
            : prev,
        );
        setBalance(res.balance);
        setRegeneratingType(null);
        toast.success(
          `"${res.result.title}" yeniden üretildi! ${cost} kredi kullanıldı.`,
        );
      } catch {
        toast.error("Beklenmeyen bir hata oluştu.");
        setRegeneratingType(null);
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
        const uploaded = await ensureSourceUploaded();
        if (!uploaded) return;
        const { src, additional } = uploaded;

        const res = await generateCreativeAction({
          sourcePath: src.sourcePath,
          mimeType: src.mimeType,
          category: category || undefined,
          aspectRatio,
          quality,
          additionalSources: additional,
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
  };
}
