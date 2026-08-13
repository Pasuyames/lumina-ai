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
| 10 | Landing placeholder, galeri görselsiz | Consider | Şablon galerisi ✅ C11 (gradient önizleme); landing before/after hâlâ C2 bekliyor |
| ✅ | Güvenlik ekseni: rate limit, magic-bytes, open-redirect, başlıklar, audit 0 | — | Tamam (2026-07-03) |

## 4. Faz Planı

### Faz A — Mühendislik Temeli ✅ TAMAMLANDI (2026-07-03, Sonnet 5)
Doğrulama: lint 0/0, tsc temiz, 20/20 test yeşil, build başarılı, 8 commit.

- [x] A1. `git init` + ilk commit (`e9fbe6e`) — .env.local git dışında doğrulandı
- [x] A2. Lint temizliği (`2ab1315`)
- [x] A3. Refaktör: upload/concept/render/result-step bileşenleri; studio-client 240 satır orkestrasyon (`2b051f3`)
- [x] A4. `next/image` + remotePatterns (`3a50642`)
- [x] A5. Vitest + 20 birim test; `safeInternalPath` → `lib/security/redirect.ts` (`788acf0`)
- [x] A6. `/api/health` (`b367e49`)
- [x] A7. GitHub Actions CI (`fbe48d4`) — GitHub remote eklenince otomatik çalışır
- [x] A8. Temel a11y: role="alert", aria-describedby, aria-label (`920f2dc`) —
      not: accesslint canlı denetimi CDP hatası verdi, manuel yapıldı; D fazında tekrar dene

### Faz B — Canlı Doğrulama (kullanıcı onayı ŞART — API maliyeti)
- [ ] B1. 3-5 gerçek ürün fotoğrafıyla uçtan uca smoke test
- [ ] B2. PRESERVE_INSTRUCTION + konsept promptlarının gerçek çıktıya göre kalibrasyonu
- [ ] B3. Kredi düşme/iade akışının canlı doğrulaması

### Faz C — İçerik & UX
> Kapsam 2026-07-03'te vibedesignapp.com analiziyle güncellendi. Ana bulgular:
> (1) Mevcut paket fiyatları API maliyetinin ALTINDA (5₺/görsel satış vs ~5-6₺
> maliyet) — piyasa 26-32₺/görsele alıcı buluyor; (2) koruma teknolojisine isim
> vermek ("DokuKilidi") güven satıyor; (3) "krediler yanmaz / otomatik yenileme
> yok / gizli ücret yok" güven blokları; (4) 4K premium kademe fırsatı.

- [x] C1. Şablon kütüphanesi 6 → 36 (30 flagship + 6 extended; filtre/arama UI) — 2026-07-03
- [ ] C2. Şablon referans görselleri (script hazır: `generate-template-refs.mjs` — onay gerekli)
- [x] C3. Önce/sonra slider'ı (`before-after-slider.tsx`, bağımlılıksız) — 2026-07-03, Sonnet
- [x] C4. En-boy oranı + 2K/4K kalite seçimi; `lib/credits.ts` creditCostFor + test — 2026-07-03
- [x] C5. Aşamalı ilerleme mesajları (`use-progress-messages.ts`) — 2026-07-03
- [x] C6. Landing yenileme: hero + 3 adım + DokuKilidi + güven bloğu + SSS — 2026-07-03
      · NOT: `public/examples/dokukilidi-{before,after}.jpg` bekleniyor (C2 ile üretilecek)
- [x] C7. Mobil "Fotoğraf Çek" butonu (capture input) — 2026-07-03
- [x] C8. Yeniden fiyatlandırma 249₺/599₺/1.690₺ — schema seed + UPDATE bloğu;
      yerel DB'ye uygulandı ve doğrulandı — 2026-07-03
- [ ] C9. Katman 2-3 şablonlar (extended ~100 + mevsimsel ~20; madencilik çıktısı `data/mined-prompts.json` hammadde)
- [x] C10. **SATIŞ SETİ** — tek fotoğraftan 4 karelik e-ticaret listeleme seti:
      ① temiz packshot (beyaz fon, pazaryeri ana görseli) ② model üstünde /
      kullanım anı (YÜZ KADRAJ DIŞI — tekinsiz vadi yok, e-ticarette standart)
      ③ detay/makro (doku, dikiş, donanım) ④ atmosfer/hero (premium editoryal).
      Vision analizi ürüne göre 4 shot promptu üretir (giyilebilir → model
      üstünde; değilse → elde kullanım). Hiper-gerçekçilik çıpaları zorunlu
      (DSLR görünümü, doğal kusurlar, film greni — "AI olduğu anlaşılmasın").
      4 kredi (2K) / 8 kredi (4K); kredi görsel başına yalnızca başarıda düşer;
      generations.set_id ile gruplanır. Paralel render (allSettled), kısmi
      başarı destekli. NOT: prod'da uzun istek — Faz F'de kuyruğa taşınacak.
      — 2026-07-07, Sonnet 5: `lib/gemini/sales-set.ts` (analyzeForSalesSet) +
      `lib/sales-set-shots.ts` (normalizeShots, saf/testli) + `generateSalesSetAction`
      + `SalesSetPanel`/`SalesSetResult` UI. Canlı API çağrısı yapılmadı (yasak),
      lint/tsc/build temiz, 22→32 test yeşil.
- [x] C11. Üretilmiş görseller boş kutu görünüyordu — kök neden: Next 16
      `images.dangerouslyAllowLocalIP` varsayılanı `false` oldu; remotePatterns
      eşleşse bile optimizer 127.0.0.1'i private IP sayıp 400 "not allowed"
      döndürüyordu. Fix: `next.config.ts`'te dev'de `dangerouslyAllowLocalIP: true`
      (NODE_ENV bazlı, prod'u etkilemez). — 2026-07-08, Sonnet 5
- [ ] C12. **SATIŞ SETİ v2** — canlı test eleştirisiyle kapsam (2026-07-08).
      Mevcut 4 kare listelemenin ilk 4 görselini dolduruyor; gerçek satıcı 6-8
      görselle listeler. Öncelik sırasıyla:
      ① **Çok açılı girdi**: müşteri 2-3 fotoğraf yükler (ön/arka/iç) → her
        açının packshot'ı üretilir. Tek fotoğraftan arka yüz ASLA uydurulmaz —
        DokuKilidi vaadiyle çelişir; görülmeyen açı üretilmez.
      ② **Tek kare yeniden üretim**: set sonucunda beğenilmeyen kare için
        "bu kareyi yeniden çevir" (1 kredi, aynı set_id'ye yeni kayıt).
      ③ **Ölçü/infografik karesi**: ölçüler kullanıcıdan formla alınır; metin
        bindirme AI'ya BIRAKILMAZ (metin render güvenilmez) — packshot üstüne
        istemci tarafında canvas/SVG overlay.
      ④ **Platform hedefi**: Trendyol/Hepsiburada (3:4), Amazon (1:1),
        Instagram (4:5) seçimi → set oranları hedefe göre kurulur.
      · B2 kalibrasyonu (2026-07-08 ✅): kullanıcı canlı çıktıda rustik ahşap
        masa sahnesini "kaliteyi düşürüyor" diye eledi → analyze.ts + sales-set.ts
        Vision sistem promptlarına "ucuzlatan sahne yasağı + premium zemin
        zorunluluğu" eklendi (mermer/taş/kadife/saten/cam/lake; ahşap yalnızca
        lüks bağlamda).
      · Lüks imza görünümü (2026-07-08 ✅): `generate.ts`'e LUXURY_ANCHOR —
        her render'a kod tarafında zorlanan lüks kampanya estetiği (premium
        ışık/renk/doku işleme; sahne içeriğine karışmaz). Vision promptlarına
        da "lüks marka kampanyası dili" kuralı (Cartier/Rolex/Hermès çıtası).

- [x] C14. **KREATİF ÜRET** — 5. başlangıç yolu, tek tık sürpriz üretim.
      `lib/gemini/creative.ts` (analyzeForCreative): Vision cüretkar/sanatsal
      TEK sahne tasarlar (yüksek temperature 1.1, güvenli e-ticaret kalıpları
      dışında — beklenmedik ortam/renk/kompozisyon; ucuzlatan sahne yasağı ve
      LUXURY_ANCHOR yine geçerli, generate.ts'te otomatik uygulanıyor).
      `generateCreativeAction` (studio/actions.ts): analiz + render tek
      istekte, konsept seçim adımı yok; kredi yalnızca başarılı render
      sonrası düşer (creditCostFor(quality)); rate limit `creative:` 15/sa.
      StartPanel'de "Kreatif Üret" butonu (Shuffle ikonu), AI Konsept
      Öner'in altındaki ikincil satırda. — 2026-07-08

### Frontend Denetim + Refactor — TAMAMLANDI (2026-07-08, Sonnet 5)
Plan dosyası: `C:\Users\musta\.claude\plans\linked-wishing-storm.md` (3 paralel
keşif ajanı + Plan ajanıyla hazırlandı, kullanıcı onayladı). Backend/kredi/RLS
mantığına dokunulmadı, yeni bağımlılık eklenmedi.

**Faz A (yüksek etki, düşük risk) — commit'ler 04c0383/5e4bd1a/ef4b320/dbc29a4:**
- Billing satın alma butonuna pending state (`purchase-button.tsx`, useFormStatus)
- `getGenerationById` — merkezi sorgu katmanına taşındı (`lib/queries.ts`)
- "2K görseli indir" hardcode bug'ı → `qualityLabelFor(creditsSpent)` gerçek kaliteyi gösterir
- **Mobil hamburger navigasyon** (kritik eksik — mobilde /studio ve /generations'a
  hiç yol yoktu) — `mobile-nav.tsx`, mevcut Dialog primitive'i reuse edildi
- Navbar aktif route vurgusu (`nav-link.tsx`, usePathname + aria-current)
- Doğrulama: lint/tsc/test yeşil + gerçek Playwright testiyle mobil menü
  açma/linke tıklama/kapanma ve aktif route vurgusu görsel olarak teyit edildi.

**Faz B (bileşen konsolidasyonu) — commit'ler fd1d494/d38f238/0fc7504/267d547/
0598528/96ae55a/5aa36ce/a8237a4:**
- `app-shell.tsx` (Navbar+main+Footer ortak iskelet)
- `page-header.tsx` (başlık+genişlik standardizasyonu, 5 sayfa)
- `empty-state.tsx`, `spinner.tsx` (tekilleştirme)
- `studio/*` içinde Card'ın seçici benimsenmesi (statik konteynerler geçti,
  interaktif/gradient kartlara dokunulmadı)
- Landing `PLANS` hardcode kaldırıldı → `getActivePackages()` + paylaşılan
  `package-card.tsx` (landing artık billing ile senkron gerçek fiyat gösteriyor)
- **`studio-client.tsx` (477 satır) → `hooks/use-studio-generation.ts`** (en
  riskli madde — üretim mantığı/state saf taşımayla hook'a çıkarıldı, davranış
  birebir korundu)
- Route-level `loading.tsx` iskeletleri (dashboard/generations/billing)
- Doğrulama: lint/tsc/test/build yeşil + gerçek Playwright testiyle landing
  fiyat senkronu, dashboard/generations görsel regresyon yokluğu, `/studio`
  AI Konsept Öner akışı (analiz→3 konsept) uçtan uca doğrulandı — görsel
  üretim API'si test için ÇAĞRILMADI.

**Faz C (bilerek YAPILMADI, follow-up):** dark mode toggle (next-themes kurulu
ama unwired), derin a11y geçişi (image-dropzone/concept-card), SSS accordion,
ikon boyutu kozmetik temizliği, `--sidebar-*` ölü CSS token'larının kaderi.

### Pazarlama Sitesi — Yeni Tasarıma Geçiş ✅ TAMAMLANDI (2026-08-13)
Ayrıntılı kayıt: **`docs/tasks/yeni-tasarim-gecisi.md`**.

Özet: landing (`(marketing)/page.tsx`) referans tasarıma göre baştan yazıldı;
renk paleti ve hero gökyüzü kapağı korundu, sitedeki TÜM ürün görselleri
Stüdyo'nun gerçek üretimlerinden statik dosya olarak `public/showcase/` altına
alındı (sahte yorum/rakam üretilmedi). Başlık ve altbilgi tüm sitede tekleşti
(`site/site-header*.tsx` + `site/site-footer.tsx`; eski `navbar.tsx`/
`nav-link.tsx`/`footer.tsx` SİLİNDİ — geri eklenmemeli). Yol boyunca üç eski
hata düzeltildi: `"/studio"` önekinin herkese açık `/studios`u kilitlemesi,
flex kapsayıcıda `mx-auto` daralması, Stüdyo'daki iki panelin hizasızlığı.

⚠️ Kalıcı kural: motion bileşenlerinde `useReducedMotion()` ile render
dallandırma YAPILMAZ (SSR hydration uyuşmazlığı içeriği kalıcı `opacity:0`da
bırakıyor); karar kökteki `MotionConfig`ten verilir — şu anki değer `"never"`.

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
