import { describe, expect, it } from "vitest";
import { sniffImageType, validateImageUpload } from "@/lib/security/image";

/** Gerçek magic-byte imzalarına sahip minimal (geçersiz gövdeli) tampon üretir. */
function jpegBytes(length = 20): Buffer {
  const buf = Buffer.alloc(length, 0);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  return buf;
}

function pngBytes(length = 20): Buffer {
  const buf = Buffer.alloc(length, 0);
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  sig.forEach((b, i) => (buf[i] = b));
  return buf;
}

function webpBytes(length = 20): Buffer {
  const buf = Buffer.alloc(length, 0);
  buf.write("RIFF", 0, "ascii");
  buf.write("WEBP", 8, "ascii");
  return buf;
}

describe("sniffImageType", () => {
  it("JPEG magic byte'larını tespit eder", () => {
    expect(sniffImageType(jpegBytes())).toBe("image/jpeg");
  });

  it("PNG magic byte'larını tespit eder", () => {
    expect(sniffImageType(pngBytes())).toBe("image/png");
  });

  it("WebP (RIFF/WEBP) imzasını tespit eder", () => {
    expect(sniffImageType(webpBytes())).toBe("image/webp");
  });

  it("sahte içerik (ör. exe MZ başlığı) için null döner", () => {
    const exeBytes = Buffer.alloc(20, 0);
    exeBytes.write("MZ", 0, "ascii");
    expect(sniffImageType(exeBytes)).toBeNull();
  });

  it("12 bayttan kısa tamponlar için null döner", () => {
    expect(sniffImageType(jpegBytes(11))).toBeNull();
  });
});

/** Node ortamında minimal bir File nesnesi oluşturur. */
function makeFile(bytes: Buffer, name: string, type: string): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("validateImageUpload", () => {
  it("File olmayan girdiyi reddeder", async () => {
    const result = await validateImageUpload("not-a-file");
    expect(result.ok).toBe(false);
  });

  it("boş dosyayı reddeder", async () => {
    const file = makeFile(Buffer.alloc(0), "empty.png", "image/png");
    const result = await validateImageUpload(file);
    expect(result.ok).toBe(false);
  });

  it("10 MB üstü dosyayı reddeder", async () => {
    const big = Buffer.concat([pngBytes(), Buffer.alloc(11 * 1024 * 1024, 1)]);
    const file = makeFile(big, "big.png", "image/png");
    const result = await validateImageUpload(file);
    expect(result.ok).toBe(false);
  });

  it("MIME'ı image/png diyen ama içeriği farklı olan dosyayı reddeder", async () => {
    const fakeContent = Buffer.alloc(20, 0);
    fakeContent.write("MZ", 0, "ascii");
    const file = makeFile(fakeContent, "fake.png", "image/png");
    const result = await validateImageUpload(file);
    expect(result.ok).toBe(false);
  });

  it("geçerli bir PNG'yi kabul eder ve mimeType'ı içerikten belirler", async () => {
    const file = makeFile(pngBytes(), "photo.png", "image/png");
    const result = await validateImageUpload(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mimeType).toBe("image/png");
      expect(result.ext).toBe("png");
    }
  });
});
