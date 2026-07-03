"use client";

import { Label } from "@/components/ui/label";
import { ImageDropzone } from "@/components/studio/image-dropzone";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

/** SOL panel: görsel yükleme + kategori seçimi. */
export function UploadStep({
  previewUrl,
  onSelect,
  onClear,
  category,
  onCategoryChange,
  disabled,
}: {
  previewUrl: string | null;
  onSelect: (file: File) => void;
  onClear: () => void;
  category: string;
  onCategoryChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-4">
      <ImageDropzone
        previewUrl={previewUrl}
        onSelect={onSelect}
        onClear={onClear}
        disabled={disabled}
      />
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
