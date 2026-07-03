/** Uygulama geneli sabitler. */

export const APP_NAME = "Lumina";
export const APP_TAGLINE = "Yapay zekâ destekli ürün fotoğrafçılığı";

/** Bir final görsel üretiminin kredi maliyeti. */
export const CREDITS_PER_GENERATION = 1;

/** Hedef ürün kategorileri (Gemini Vision'a bağlam olarak verilir). */
export const PRODUCT_CATEGORIES = [
  { value: "jewelry", label: "Takı" },
  { value: "watch", label: "Saat" },
  { value: "bag", label: "Çanta" },
  { value: "accessory", label: "Aksesuar" },
  { value: "other", label: "Diğer" },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["value"];

/** Yüklemeler için kabul edilen görsel tipleri ve boyut limiti. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  studio: "/studio",
  generations: "/generations",
  gallery: "/studios",
  billing: "/billing",
} as const;
