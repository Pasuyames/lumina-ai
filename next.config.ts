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
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
