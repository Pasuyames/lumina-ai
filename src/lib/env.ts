/**
 * Merkezî ortam değişkeni erişimi.
 * Eksik kritik değişkenlerde erken ve anlaşılır hata fırlatır.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Eksik ortam değişkeni: ${name}. .env.local dosyanızı kontrol edin (.env.example'a bakın).`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  freeSignupCredits: Number(
    process.env.NEXT_PUBLIC_FREE_SIGNUP_CREDITS ?? "3",
  ),
} as const;

/** Yalnızca sunucu tarafında erişilebilir gizli değişkenler. */
export const serverEnv = {
  supabaseServiceRoleKey: () =>
    required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
  geminiApiKey: () => required("GEMINI_API_KEY", process.env.GEMINI_API_KEY),
  geminiVisionModel: process.env.GEMINI_VISION_MODEL ?? "gemini-2.5-pro",
  geminiImageModel:
    process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image-preview",
} as const;
