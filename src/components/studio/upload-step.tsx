"use client";

import { Label } from "@/components/ui/label";
import { ImageDropzone } from "@/components/studio/image-dropzone";
import { AdditionalAngles } from "@/components/studio/additional-angles";
import { PRODUCT_CATEGORIES, MAX_ADDITIONAL_ANGLES } from "@/lib/constants";

/** SOL panel: görsel yükleme + kategori seçimi. */
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
    <div className="space-y-4">
      <ImageDropzone
        previewUrl={previewUrl}
        onSelect={onSelect}
        onClear={onClear}
        disabled={disabled}
      />
      {previewUrl && (
        <AdditionalAngles
          previewUrls={additionalPreviewUrls}
          onAdd={onAddAdditional}
          onRemove={onRemoveAdditional}
          disabled={disabled}
          max={MAX_ADDITIONAL_ANGLES}
        />
      )}
      <div className="space-y-1.5">
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
