"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants";

export function ImageDropzone({
  previewUrl,
  onSelect,
  onClear,
  disabled,
}: {
  previewUrl: string | null;
  onSelect: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validateAndSelect(file: File | undefined) {
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
    onSelect(file);
  }

  if (previewUrl) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-muted">
        <Image
          src={previewUrl}
          alt="Yüklenen ürün"
          fill
          sizes="(min-width: 1024px) 40vw, 90vw"
          unoptimized
          className="object-contain"
        />
        {!disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
            aria-label="Görseli kaldır"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          validateAndSelect(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-card text-center transition",
          dragOver
            ? "border-primary bg-accent/40"
            : "border-border hover:border-primary/50 hover:bg-accent/20",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <UploadCloud className="size-7" />
        </span>
        <span className="px-6">
          <span className="font-heading block text-base font-medium">
            Ürün görselini yükleyin
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Sürükleyip bırakın ya da tıklayın · JPEG, PNG, WebP · maks. 10 MB
          </span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => validateAndSelect(e.target.files?.[0])}
      />

      {/* Mobilde doğrudan kamera açan ikinci seçenek — masaüstü akışı değişmez. */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => cameraInputRef.current?.click()}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-accent/20 disabled:pointer-events-none disabled:opacity-60 sm:hidden"
      >
        <Camera className="size-4" />
        Fotoğraf Çek
      </button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => validateAndSelect(e.target.files?.[0])}
      />

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
