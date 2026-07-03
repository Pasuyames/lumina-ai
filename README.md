# Lumina — Yapay Zekâ Destekli Ürün Fotoğrafçılığı SaaS

E-ticaret satıcıları (takı, saat, çanta) için ham ürün fotoğraflarını stüdyo
kalitesinde 2K görsellere dönüştüren SaaS platformu.

## Teknoloji Yığını

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (base-nova / Base UI primitifleri)
- **Supabase** — Auth + PostgreSQL + Storage
- **Google Gemini** — Vision (konsept analizi) + Nano Banana 2 (görsel üretim)

## Mimari

```
src/
├─ app/
│  ├─ (marketing)/        # Herkese açık: landing + Hazır Stüdyolar galerisi
│  ├─ (auth)/             # login / register + auth server actions
│  ├─ (app)/              # Oturum zorunlu: dashboard, studio, generations, billing
│  └─ auth/callback/      # E-posta onayı / OAuth dönüşü
├─ components/
│  ├─ ui/                 # shadcn bileşenleri + ButtonLink yardımcısı
│  ├─ site/               # navbar, footer, logo
│  ├─ auth/               # auth-form (useActionState)
│  └─ billing/            # credit-badge
├─ lib/
│  ├─ supabase/           # client / server / admin istemcileri + types
│  ├─ env.ts              # ortam değişkeni doğrulama
│  ├─ constants.ts        # kategoriler, rotalar, limitler
│  ├─ templates.ts        # İlham Galerisi (gizli promptlar)
│  └─ queries.ts          # sunucu veri sorguları
├─ proxy.ts               # oturum tazeleme + rota koruması (eski "middleware")
supabase/
└─ schema.sql             # tablolar + RLS + kredi RPC'leri + trigger + storage
```

## Kurulum

### 1. Bağımlılıklar

```bash
pnpm install
```

### 2. Ortam değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın ve doldurun:

```bash
cp .env.example .env.local
```

| Değişken | Nereden |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → service_role (gizli!) |
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey |

### 3. Veritabanı şeması

Supabase → **SQL Editor** → `supabase/schema.sql` içeriğini yapıştırıp çalıştırın.
Bu şema şunları kurar:

- `profiles`, `credits`, `credit_transactions`, `generations`, `packages`, `purchases`
- **Yeni kayıt → otomatik profil + 3 ücretsiz kredi** (`handle_new_user` trigger)
- Atomik kredi fonksiyonları: `spend_credits`, `grant_credits`
- Tüm tablolarda **Row Level Security**
- `product-images` storage bucket'ı + erişim politikaları

### 4. Geliştirme sunucusu

```bash
pnpm dev
```

## Kredi Sistemi

- Her yeni kullanıcı **3 ücretsiz görsel hakkı** ile başlar.
- Her başarılı üretim **1 kredi** harcar (`spend_credits` RPC — atomik, yarış
  koşulu güvenli).
- Kredi bittiğinde arayüz otomatik **"Paket Satın Al"** çağrısına döner.
- Ödeme şu an **mock** modunda (`provider: 'mock'`). Stripe/Iyzico entegrasyonu
  `src/app/(app)/billing/actions.ts` içindeki yer tutucunun yerine gelecek.

## AI Pipeline (Faz 2)

İki aşamalı akış `src/lib/gemini/` + `src/app/(app)/studio/`:

1. **Aşama 1 — Analiz** (`analyze.ts`, `analyzeProductAction`): yüklenen görsel
   `product-images` bucket'ına kaydedilir, Gemini Vision (`gemini-2.5-pro`) ürünü
   inceler ve **zorunlu JSON şema** ile 3 konsept (title/description TR, prompt EN)
   döndürür. **Kredi düşmez.**
2. **Aşama 2 — Render** (`generate.ts`, `generateImageAction`): seçilen konsept
   (veya Hazır Stüdyo gizli promptu / kullanıcının özel promptu) + kaynak görsel
   Nano Banana 2'ye (`gemini-3-pro-image-preview`) gönderilir; orijinal ürün
   korunarak 2K render üretilir, sonuç depolanır ve **`spend_credits` ile 1 kredi
   düşülür** (yalnızca başarılı render sonrası).

> Notlar: `imageConfig.imageSize: "2K"` bazı SDK sürümlerinde yok sayılabiliyor
> (Google bilinen sorun). Model adları `.env.local`'dan override edilebilir.

## Yol Haritası

- [x] **Faz 1** — İskelet: Next.js + Tailwind/shadcn + Supabase + kredi sistemi
- [x] **Faz 2** — AI Pipeline (Vision analizi + Nano Banana 2 render + kredi düşümü)
- [ ] **Faz 3** — Gerçek ödeme entegrasyonu (Stripe/Iyzico)
