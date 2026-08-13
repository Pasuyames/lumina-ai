"use client";

import { Label } from "@/components/ui/label";
import { ImageDropzone } from "@/components/studio/image-dropzone";
import { AdditionalAngles } from "@/components/studio/additional-angles";
import { PRODUCT_CATEGORIES, MAX_ADDITIONAL_ANGLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * SOL panel: görsel yükleme + kategori seçimi.
 *
 * Masaüstünde kök `lg:contents` ile ızgaradan çıkar; böylece yükleme alanı
 * doğrudan ızgaranın 1. satırına oturur ve sağdaki panelle AYNI hizada
 * biter. Ek açılar ve kategori seçimi ise 1. sütunun alt satırlarına
 * yerleşir (sağ tarafta karşılığı yok).
 */
export function UploadStep({
  previewUrl,
  onSelect,
  onClear,
  category,
  onCategoryChange,
  disabled,
  additionalPreviewUrls,
  onAddAdditional,
  onRemoveAdditional,
}: {
  previewUrl: string | null;
  onSelect: (file: File) => void;
  onClear: () => void;
  category: string;
  onCategoryChange: (value: string) => void;
  disabled: boolean;
  additionalPreviewUrls: string[];
  onAddAdditional: (file: File) => void;
  onRemoveAdditional: (index: number) => void;
}) {
  return (
    <div className="space-y-4 lg:contents">
      <ImageDropzone
        previewUrl={previewUrl}
        onSelect={onSelect}
        onClear={onClear}
        disabled={disabled}
        className="lg:col-start-1 lg:row-start-1"
      />
      {previewUrl && (
        <div className="lg:col-start-1 lg:row-start-2">
          <AdditionalAngles
            previewUrls={additionalPreviewUrls}
            onAdd={onAddAdditional}
            onRemove={onRemoveAdditional}
            disabled={disabled}
            max={MAX_ADDITIONAL_ANGLES}
          />
        </div>
      )}
      <div
        className={cn(
          "space-y-1.5 lg:col-start-1",
          previewUrl ? "lg:row-start-3" : "lg:row-start-2",
        )}
      >
        <Label htmlFor="category">Kategori (opsiyonel)</Label>
        <select
          id="category"
          value={category}
          disabled={disabled}
          onChange={(e) => onCategoryChange(e.target.value)}
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
  );
}
