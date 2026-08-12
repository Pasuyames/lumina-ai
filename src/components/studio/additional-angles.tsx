"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants";

/**
 * Ana ürün fotoğrafına ek olarak yüklenebilen açı fotoğrafları (yan/arka
 * vb.) — küçük thumbnail satırı + "+ Açı Ekle" butonu. `ImageDropzone`'daki
 * `validateAndSelect` deseniyle AYNI doğrulama (tip + boyut) burada tekrar
 * uygulanır — ayrı bir dosya seçim akışı olduğu için paylaşılamıyor.
 */
export function AdditionalAngles({
  previewUrls,
  onAdd,
  onRemove,
  disabled,
  max,
}: {
  previewUrls: string[];
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
  disabled: boolean;
  max: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function validateAndAdd(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Yalnızca JPEG, PNG veya WebP.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Görsel 10 MB sınırını aşıyor.");
      return;
    }
    setError(null);
    onAdd(file);
  }

  const canAddMore = previewUrls.length < max;

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">
        Ek açı fotoğrafları (opsiyonel) — yan/arka açılar modelin ürünü daha
        sadık üretmesine yardımcı olur.
      </p>
      <div className="flex flex-wrap gap-2">
        {previewUrls.map((url, i) => (
          <div
            key={url}
            className="relative size-16 overflow-hidden rounded-lg border border-border bg-muted"
          >
            <Image
              src={url}
              alt={`Ek açı ${i + 1}`}
              fill
              sizes="64px"
              unoptimized
              className="object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
                aria-label={`Ek açıyı kaldır ${i + 1}`}
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        ))}
        {canAddMore && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex size-16 flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-border text-muted-foreground transition hover:border-primary/50 hover:bg-accent/20 disabled:pointer-events-none disabled:opacity-60"
            aria-label="Açı ekle"
          >
            <Plus className="size-4" />
            <span className="text-[10px]">Açı Ekle</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          validateAndAdd(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
