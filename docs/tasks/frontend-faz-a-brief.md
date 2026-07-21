# Görev Brifi — Frontend Refactor Faz A (yüksek etki, düşük risk)

> Yürütücü: Sonnet subagent · Tarih: 2026-07-08
> ÇALIŞMA TARZI: YAVAŞ VE DOĞRU. Her madde sonrası lint+tsc çalıştır, kırmızı
> görmeden sonrakine geçme. Backend mantığına (Supabase sorguları dışında,
> RLS, kredi RPC akışı, Gemini çağrıları, auth) DOKUNMA. Yeni npm bağımlılığı
> EKLEME. Bu görev, onaylanmış bir plandan (C:\Users\musta\.claude\plans\
> linked-wishing-storm.md) türetildi — orada Faz A/B tam gerekçeleriyle var,
> ihtiyaç olursa oku.

## Bağlam

Proje: Lumina (C:\Users\musta\Desktop\lumina) — AI ürün fotoğrafçılığı SaaS.
Next.js 16 (App Router, Turbopack) + React 19 + TS + Tailwind v4 (CSS-first,
`src/app/globals.css`) + shadcn/ui **base-nova** preset (Base UI — `asChild`
YOK, `render` prop veya `src/components/ui/button-link.tsx` ButtonLink
kullanılır). Supabase yerel (Docker, http://127.0.0.1:54321). UI metinleri ve
kod yorumları TÜRKÇE.

Ortam ŞU AN AYAKTA: Docker + Supabase. Dev sunucu portu **3001** (3000 başka
projeye ait, DOKUNMA). Test hesabı: admin@lumina.test / lumina123.

Bu, kapsamlı bir frontend denetiminin (3 paralel keşif ajanı) ürünü. En
kritik bulgu: **mobilde `/studio` ve `/generations` sayfalarına hiçbir
navigasyon yolu yok** — navbar'daki linkler `hidden md:flex` ile mobilde tam
gizli, avatar dropdown'da da bu linkler yok. Bu gerçek bir kayıp kullanıcı
riski, öncelik #1.

## Yapılacaklar (SIRAYLA — her madde sonrası `pnpm lint` + `pnpm exec tsc --noEmit`)

### 1. Billing satın alma butonuna pending state
- Yeni dosya: `src/components/billing/purchase-button.tsx` (`"use client"`).
  `useFormStatus` (react-dom) kullan — `Button disabled={pending}` +
  `pending ? <Loader2 className="size-4 animate-spin" /> : ...`.
- `src/app/(app)/billing/page.tsx`'teki mevcut submit butonunu bu bileşenle
  değiştir. **`purchasePackageAction` (actions.ts) DEĞİŞMEYECEK** — sadece
  form içindeki submit butonu client bileşene taşınıyor.
- Referans desen: `src/components/auth/auth-form.tsx` (useActionState +
  pending spinner deseni — birebir kopyalama değil, aynı UX hissi).

### 2. `getGenerationById` — merkezi sorgu katmanına taşıma
- `src/lib/queries.ts`'e ekle:
  ```
  getGenerationById(userId: string, id: string): Promise<Generation | null>
  ```
  `getGenerations` fonksiyonuyla birebir desen: `.from("generations").select("*").eq("id", id).eq("user_id", userId).maybeSingle()`.
- `src/app/(app)/generations/[id]/page.tsx`'teki doğrudan `supabase.from("generations")...`
  çağrısını bu fonksiyona taşı (`createClient()` importunu kaldırabilirsin
  eğer başka yerde kullanılmıyorsa). Sorgu mantığı AYNI kalmalı, sadece yer
  değiştiriyor.

### 3. "2K görseli indir" hardcode bug'ı
- `src/lib/credits.ts`'e ekle:
  ```
  qualityLabelFor(creditsSpent: number): RenderQuality
  ```
  Mantık: `creditsSpent >= 2 ? "4K" : "2K"` (mevcut `creditCostFor`'un
  tersi — 2K→1 kredi, 4K→2 kredi haritasıyla tutarlı olmalı, `creditCostFor`
  fonksiyonuna bak).
- `src/app/(app)/generations/[id]/page.tsx` içinde "2K görseli indir" sabit
  metnini `` `${qualityLabelFor(g.credits_spent)} görseli indir` `` ile
  değiştir.
- Doğrulama: Satış Seti kareleri de `credits_spent`'i kare-başına
  (`creditCostFor(quality)`) kaydediyor, toplam değil — bu yüzden bu etiket
  satış seti kayıtları için de doğru çalışır, ekstra kontrol gerekmez.

### 4. Mobil navigasyon (KRİTİK)
- Yeni dosya: `src/components/site/mobile-nav.tsx` (`"use client"`).
- Hamburger ikonu (lucide `Menu`) tetikleyici, `src/components/ui/dialog.tsx`
  (mevcut Base UI Dialog sarmalayıcısı) reuse edilerek tam-genişlik/yan panel
  açılır (className override ile — yeni primitive/bağımlılık YOK).
- İçerik: Stüdyo (`ROUTES.studio`), Hazır Stüdyolar (`ROUTES.gallery`),
  (girişliyse) Üretimlerim (`ROUTES.generations`) + Panel (`ROUTES.dashboard`),
  Kredi & Paketler (`ROUTES.billing`), Çıkış (`signOutAction` formu — bkz.
  `navbar.tsx`'teki mevcut dropdown içeriği, aynı link seti mobilde de olsun).
  Girişli değilse: Giriş/Ücretsiz Başla linkleri.
- Panel açılınca bir linke tıklanınca kapanmalı (route değişince).
- `src/components/site/navbar.tsx` (server component) bu client bileşeni
  `md:hidden` bir alanda render eder, `user`/`credits` prop olarak geçirilir
  (zaten server'da fetch ediliyor, tekrar fetch ETME — mevcut veriyi prop'la
  taşı).

### 5. Aktif route vurgusu
- `navbar.tsx` içindeki `NavLink` fonksiyonunu (satır ~109-127) küçük bir
  `"use client"` alt bileşene çıkar (aynı dosyada kalabilir veya
  `src/components/site/nav-link.tsx` — sen karar ver, küçük diff'i tercih
  et). `usePathname()` ile `href === pathname` kontrolü, aktifse
  `aria-current="page"` + görsel vurgu (`text-foreground bg-accent/50` gibi,
  mevcut hover stiline uyumlu).
- Madde 4 ile aynı dosyada (navbar.tsx) değişiklik yapıyorsun, ikisini
  birlikte küçük bir diff'te bitir.

## Kabul Kriterleri
- [ ] `pnpm lint` → 0 hata
- [ ] `pnpm exec tsc --noEmit` → 0 hata
- [ ] `pnpm test` → 32/32 yeşil (yeni test EKLEMENE gerek yok, mevcutlar kırılmasın)
- [ ] Mobil viewport (tarayıcı devtools ~375px genişlik) manuel kontrol:
      hamburger açılıyor, Stüdyo/Hazır Stüdyolar/Üretimlerim linkleri
      erişilebilir, tıklayınca panel kapanıp doğru sayfaya gidiyor
- [ ] Desktop'ta aktif sayfa navbar'da görsel olarak vurgulanıyor
- [ ] `/generations/[id]` sayfasında indirme butonu gerçek kaliteyi gösteriyor
      (bir 2K ve mümkünse bir 4K kaydı kontrol et — DB'de yoksa `credits_spent`
      değerini elle bir test kaydında değiştirip kontrol edebilirsin, SONRA geri al)
- [ ] Billing sayfasında satın alma butonuna basınca pending/disabled görünüyor
- [ ] Küçük, konu-odaklı commit'ler (Türkçe mesaj, `git log --oneline` ile stile bak)

## Değişmez Kurallar
1. Backend/Supabase sorgu mantığı, RLS, kredi RPC akışı, Gemini çağrıları DEĞİŞMEZ.
2. Yeni npm bağımlılığı YOK.
3. Base UI `asChild` yok — `render` prop veya `ButtonLink`.
4. Mevcut tasarım dili (warm/champagne-gold OKLCH palet, Playfair Display
   başlıklar, `rounded-2xl`/`rounded-xl` radius) korunur, yeniden tasarlanmaz.
5. `.env.local` commit'lenmez.

## Bitiş
Dev sunucuyu 3001'de ÇALIŞIR halde bırak. Final raporunda: her madde için
değiştirilen/oluşturulan dosyalar, doğrulama çıktıları (lint/tsc/test
sonuçları), commit hash'leri, mobil nav'ı nasıl test ettiğin.
