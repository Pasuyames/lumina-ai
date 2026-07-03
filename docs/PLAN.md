# Lumina — Proje Dosyası ve Yol Haritası

> Son güncelleme: 2026-07-03 · Durum: Faz 1-2 tamam, güvenlik turu tamam,
> mühendislik temeli (Faz A) devrede.

## 1. Vizyon

E-ticaret satıcılarının (takı, saat, çanta, aksesuar) telefonla çektiği ham ürün
fotoğraflarını, ürünün şekli/dokusu korunarak stüdyo kalitesinde 2K görsellere
dönüştüren, kredi (jeton) sistemiyle çalışan SaaS.

**Değer önerisi:** Ürün fotoğrafçısı + stüdyo kirası (binlerce TL) yerine
görsel başına ~5-12 TL, 60 saniyede sonuç.

## 2. Teknik Envanter

| Katman | Teknoloji | Not |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TS | `src/proxy.ts` oturum koruması (middleware değil) |
| UI | Tailwind v4 + shadcn/ui **base-nova** | Base UI primitifleri — `asChild` YOK, `render` prop; link-buton için `ButtonLink` |
| Backend | Supabase (Auth + PG + Storage) | RLS + SECURITY DEFINER kredi RPC'leri; yerel: Docker `pnpm supabase start` |
| AI | @google/genai · Vision `gemini-2.5-pro` · Görsel `gemini-3-pro-image-preview` | 2 aşamalı pipeline; üretim = 1 kredi (sadece başarıda) |
| Güvenlik | `src/lib/security/{rate-limit,image,timeout}.ts` | bellek içi limiter, magic-bytes, Gemini timeout |
| Paket | pnpm | `postcss>=8.5.10` override (audit temiz) |

**Kritik akış:** yükle → (Vision 3 konsept | Hazır Stüdyo gizli prompt | özel
prompt) → Nano Banana render → storage → `spend_credits` (atomik) → sonuç.

**Test hesabı (yerel):** admin@lumina.test / lumina123.

## 3. Denetim Bulguları (agent-skills incelemesi, 2026-07-03)

Karar: **Request Changes** — demo kalitesi iyi, prod'a çıkamaz.

| # | Bulgu | Ciddiyet | Durum |
|---|---|---|---|
| 1 | Git reposu yok — geri alma/tarihçe yok | Critical | 🔧 Faz A |
| 2 | Sıfır test — kredi/güvenlik mantığı kanıtsız | Critical | 🔧 Faz A |
| 3 | AI pipeline hiç canlı çalıştırılmadı | Critical | ⏳ Faz B (onay gerekli) |
| 4 | Gözlemlenebilirlik yok (yalnız console.error) | Required | Faz A (health) + Faz D (Sentry) |
| 5 | CI/CD yok | Required | 🔧 Faz A |
| 6 | Erişilebilirlik denetlenmedi | Required | 🔧 Faz A (temel) |
| 7 | `studio-client.tsx` 506 satır (limit ~200) | Required | 🔧 Faz A |
| 8 | `<img>` yerine `next/image` yok | Required | 🔧 Faz A |
| 9 | Kullanılmayan import (CreditBadge) | Nit | 🔧 Faz A |
| 10 | Landing placeholder, galeri görselsiz | Consider | Faz C |
| ✅ | Güvenlik ekseni: rate limit, magic-bytes, open-redirect, başlıklar, audit 0 | — | Tamam (2026-07-03) |

## 4. Faz Planı

### Faz A — Mühendislik Temeli (delegasyon: Sonnet 5) 🔧 ŞİMDİ
Maliyet: 0 TL (API çağrısı yok). Kabul kriteri: `pnpm lint` + `tsc --noEmit` +
`pnpm test` + `pnpm build` dördü de temiz; her mantıksal adım ayrı commit.

- [ ] A1. `git init` + `.gitignore` doğrulaması (.env.local ASLA commit'lenmez) + ilk commit
- [ ] A2. Lint temizliği (kullanılmayan CreditBadge importu)
- [ ] A3. `studio-client.tsx` refaktörü → aşama başına alt bileşen (davranış birebir aynı)
- [ ] A4. `next/image` geçişi + `images.remotePatterns` (yerel 127.0.0.1:54321 + `*.supabase.co`)
- [ ] A5. Vitest kurulumu + birim testler: `sniffImageType` (sahte MIME dahil),
      `checkRateLimit` (pencere/limit/retryAfter), `withTimeout`, `safeInternalPath`
- [ ] A6. `/api/health` endpoint'i (env varlığı + zaman damgası; sır sızdırmaz)
- [ ] A7. GitHub Actions CI: install → lint → tsc → test → build
- [ ] A8. Temel erişilebilirlik: form label/aria ilişkileri, alt metinleri, klavye odağı

### Faz B — Canlı Doğrulama (kullanıcı onayı ŞART — API maliyeti)
- [ ] B1. 3-5 gerçek ürün fotoğrafıyla uçtan uca smoke test
- [ ] B2. PRESERVE_INSTRUCTION + konsept promptlarının gerçek çıktıya göre kalibrasyonu
- [ ] B3. Kredi düşme/iade akışının canlı doğrulaması

### Faz C — İçerik & UX
- [ ] C1. Şablon kütüphanesi 6 → 24-30 (kategori bazlı + mevsimsel; lens/kompozisyon dili)
- [ ] C2. Şablon referans görselleri (Nano Banana ile tek seferlik üretim — onay gerekli)
- [ ] C3. Önce/sonra karşılaştırma slider'ı (sonuç ekranı + landing)
- [ ] C4. En-boy oranı seçimi UI (1:1, 4:5, 9:16, 16:9)
- [ ] C5. Üretim sırasında aşamalı ilerleme mesajları
- [ ] C6. Landing'e gerçek örnekler + fiyatlandırma + SSS
- [ ] C7. Mobil kamera yakalama (`capture` attribute)

### Faz D — Prod'a Çıkış
- [ ] D1. Supabase Cloud (schema.sql tek sefer SQL Editor) + .env değişimi
- [ ] D2. Vercel deploy + domain + Auth redirect URL'leri
- [ ] D3. Sentry (hata izleme) + basit analitik
- [ ] D4. SMTP (Resend) — e-posta onayı
- [ ] D5. Storage'ı signed URL'lere geçirme (şu an bucket public)
- [ ] D6. Rate limiter'ı Upstash Redis'e taşıma (çoklu instance)

### Faz E — Ödeme (Iyzico öncelikli)
- [ ] E1. Checkout akışı + webhook → `purchases.status='paid'` → `grant_credits`
- [ ] E2. Webhook idempotency (çift kredi yüklememe)
- [ ] E3. Fatura bilgileri (şahıs/şirket, vergi no)

### Faz F — Büyüme
- [ ] F1. Toplu üretim (10 ürün + tek şablon, kuyruk)
- [ ] F2. Referans sistemi (davet = +3 kredi)
- [ ] F3. Watermark'lı ücretsiz önizleme (kredisi bitene)
- [ ] F4. Admin paneli (kullanıcı/üretim/gelir + manuel kredi)
- [ ] F5. SEO: kategori landing sayfaları

## 5. Değişmez Kurallar (tüm ajanlar/oturumlar için)

1. **Görsel üretim API'si (Nano Banana) kullanıcı onayı olmadan ASLA çağrılmaz** — gerçek para.
2. `.env.local` commit'lenmez; sırlar koda yazılmaz.
3. Kredi yalnızca başarılı render sonrası, yalnızca `spend_credits` RPC ile düşer.
4. İstemciden gelen hiçbir alana (path, fiyat, MIME, prompt) güvenilmez — sunucuda doğrula.
5. UI metinleri ve kod yorumları Türkçe; render promptları İngilizce.
6. base-nova: `asChild` yok — `render` prop veya `ButtonLink`.
