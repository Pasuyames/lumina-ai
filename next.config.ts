import type { NextConfig } from "next";

/** Tüm yanıtlara eklenen güvenlik başlıkları. */
const securityHeaders = [
  // Sayfa iframe içine gömülemez (clickjacking koruması).
  { key: "X-Frame-Options", value: "DENY" },
  // Tarayıcı MIME type tahmini yapmaz.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Dış sitelere yalnızca origin bilgisi sızar.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Kullanılmayan tarayıcı yetenekleri kapalı.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // HTTPS zorunlu (yalnızca prod'da anlamlı; localhost'u etkilemez).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Ürün görselleri server action ile yüklenir; uygulama sınırı 10 MB
      // (MAX_UPLOAD_BYTES) + form payı. Next varsayılanı 1 MB'dır.
      bodySizeLimit: "12mb",
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      // Yerel Supabase Storage (Docker).
      { protocol: "http", hostname: "127.0.0.1", port: "61321" },
      // Supabase Cloud Storage.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    // Next 16: remotePatterns eşleşse bile optimizer, hostname'i çözümleyip
    // private/loopback IP çıkarsa (127.0.0.1 dahil) isteği reddediyor
    // (varsayılan dangerouslyAllowLocalIP=false, "Local IP Restriction" breaking
    // change). Yerel Supabase Docker storage'ı 127.0.0.1 kullandığı için bu bayrak
    // olmadan optimizer, remotePatterns doğru olsa dahi 400 "url parameter is not
    // allowed" döner. Sadece dev'de aç; prod zaten genel bir hostname
    // (*.supabase.co) kullandığından bu koşulun tetiklenmesine gerek yok.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
