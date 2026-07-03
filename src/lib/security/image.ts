import "server-only";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants";

/**
 * Yüklenen dosyanın GERÇEK içeriğini doğrular (magic bytes).
 * İstemcinin bildirdiği MIME type'a güvenilmez — uzantı/type sahte olabilir.
 */

/** Dosya içeriğinden görsel tipini tespit eder; tanınmazsa null. */
export function sniffImageType(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export type ValidatedImage =
  | { ok: true; bytes: Buffer; mimeType: string; ext: string }
  | { ok: false; error: string };

/** Boyut + tip + içerik (magic bytes) doğrulaması tek noktadan. */
export async function validateImageUpload(
  file: unknown,
): Promise<ValidatedImage> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Lütfen bir ürün görseli yükleyin." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "Görsel 10 MB sınırını aşıyor." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageType(bytes);
  if (!sniffed || !ACCEPTED_IMAGE_TYPES.includes(sniffed)) {
    return { ok: false, error: "Yalnızca JPEG, PNG veya WebP desteklenir." };
  }

  return {
    ok: true,
    bytes,
    mimeType: sniffed, // istemcinin beyanı değil, içerikten tespit edilen tip
    ext: sniffed.split("/")[1],
  };
}
