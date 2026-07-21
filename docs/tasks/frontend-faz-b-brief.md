# Görev Brifi — Frontend Refactor Faz B (bileşen konsolidasyonu)

> Yürütücü: Sonnet subagent · Tarih: 2026-07-08
> ÇALIŞMA TARZI: YAVAŞ VE DOĞRU. Her madde sonrası lint+tsc çalıştır, kırmızı
> görmeden sonrakine geçme. Backend mantığına DOKUNMA. Yeni npm bağımlılığı
> EKLEME. Onaylanmış plan: C:\Users\musta\.claude\plans\linked-wishing-storm.md
> (Faz B bölümü) — gerekirse tam gerekçeleriyle oku. **Faz A zaten bitti ve
> bağımsız denetlendi** (mobil hamburger nav, aktif route vurgusu, billing
> pending state, getGenerationById, qualityLabelFor) — bu maddelere DOKUNMA,
> sadece onların üstüne inşa et.

## Bağlam

Proje: Lumina (C:\Users\musta\Desktop\lumina) — Next.js 16 + React 19 + TS +
Tailwind v4 (CSS-first) + shadcn/ui **base-nova** preset (Base UI — `asChild`
YOK, `render` prop veya `src/components/ui/button-link.tsx` ButtonLink). UI
metinleri ve kod yorumları TÜRKÇE. Ortam ayakta: Docker+Supabase
(127.0.0.1:54321), dev sunucu port 3001 (3000'e DOKUNMA). Test hesabı:
admin@lumina.test / lumina123 — **NOT: signin rate limiter var (5 deneme/15dk,
IP+email bazlı), test sırasında gereksiz yere tekrar tekrar giriş yapma.**

## Yapılacaklar (SIRAYLA — her madde sonrası `pnpm lint` + `pnpm exec tsc --noEmit`)

### 6. `src/components/site/app-shell.tsx`
`(app)/layout.tsx` ve `(marketing)/layout.tsx`'teki neredeyse birebir
`<Navbar/><main/><Footer/>` bloğunu tek bileşene çıkar. Auth redirect mantığı
`(app)/layout.tsx`'te KALIR (sadece görsel iskelet paylaşılır, yetkilendirme
mantığı taşınmaz).

### 7. `src/components/ui/page-header.tsx`
`h1.font-heading` + açıklama + sağ aksiyon slotu (`actions?: ReactNode`) +
`width: "wide" | "narrow"` prop. `width="wide"` → `mx-auto max-w-6xl px-4 py-10 sm:px-6`,
`width="narrow"` → `mx-auto max-w-5xl px-4 py-10 sm:px-6`. **ÖNEMLİ: mevcut
genişlik değerleri DEĞİŞMİYOR, sadece adlandırılıp merkezileşiyor** — hangi
sayfa hangi genişliği kullanıyorsa (dashboard/generations/studios/marketing
→ wide=6xl; billing/studio/generations/[id] → narrow=5xl) aynısını koru.
Adopte edilecek sayfalar: `dashboard/page.tsx`, `generations/page.tsx`,
`billing/page.tsx`, `(marketing)/studios/page.tsx`, `studio/page.tsx`.
`generations/[id]/page.tsx`'e DOKUNMA (o bir detay sayfası, başlık deseni
farklı — geri butonu var, ayrı tut).

### 8. `src/components/ui/empty-state.tsx`
Dashboard'daki tasarım (dashed border card + ikon + açıklama + CTA) kanonik
kabul edilir — o tasarımı bileşene çıkar (`icon`, `title`, `description`,
`action?` prop'ları). `src/app/(app)/generations/page.tsx`'teki sade metin
versiyonunu buna geçir; `src/app/(app)/dashboard/page.tsx`'i de aynı
bileşene taşı (görsel sonuç DEĞİŞMEMELİ, sadece kod tekilleşiyor).

### 9. `src/components/ui/spinner.tsx` (opsiyonel ama önerilir)
`Loader2 + animate-spin` sarmalayıcı (`className?` prop'u geçirmeye izin
ver). `src/components/billing/purchase-button.tsx`, `src/components/auth/auth-form.tsx`,
`src/components/studio/concept-step.tsx`, `src/components/studio/render-step.tsx`
içindeki inline `<Loader2 className="size-4 animate-spin" />` kullanımlarını
buna retrofit et. Görsel değişiklik OLMAMALI.

### 10. `studio/*` içinde Card benimseme — SEÇİCİ
**GEÇİR** (statik/pasif konteynerler): `src/components/studio/render-step.tsx`
(TemplatePanel sarmalayıcısı), `src/components/studio/template-gallery.tsx`
(boş durum bloğu), `src/components/studio/concept-step.tsx` (StartPanel'deki
"Yapay zekâ konsept önersin" dashed placeholder bloğu — satır ~67 civarı).

**GEÇİRME** (bilinçli istisna — dokunma): `concept-step.tsx`'teki Satış Seti
gradient/tıklanabilir kartı (satır ~44 civarı), `concept-card.tsx` (kendi
seçilebilir kart bileşeni), `template-gallery.tsx`'teki tıklanabilir galeri
kartları (satır ~130+ civarı, `TemplateCard` fonksiyonu), `sales-set-panel.tsx`
ikon+metin satırı. Bunlar `ui/card.tsx`'in desteklemediği hover/gradient/
seçili state semantiği taşıyor — zorlarsan görsel/etkileşim bozulur, YAPMA.

### 11. Landing `PLANS` hardcode kaldırma
**ÖN KOŞUL DOĞRULANDI**: `packages` tablosunda `packages_select_active`
politikası `public` rolüne (anonim dahil) `is_active=true` satırlarında
SELECT izni veriyor — bu madde güvenle uygulanabilir.

`src/app/(marketing)/page.tsx`'i `getActivePackages()` (zaten
`src/lib/queries.ts`'te var) çağıran async server component yap, sayfa
içindeki hardcoded `PLANS` dizisini SİL. Yeni paylaşılan
`src/components/billing/package-card.tsx` çıkar (paket kartı JSX'i —
isim/fiyat/kredi/CTA), hem `(marketing)/page.tsx` hem `(app)/billing/page.tsx`
bu bileşeni kullansın. Landing'deki CTA, giriş yapmamış kullanıcı için
`/register`'a, billing'deki CTA gerçek satın alma formuna (mevcut
`PurchaseButton` + `purchasePackageAction`, Faz A'da yapıldı) bağlı kalmalı —
iki sayfanın CTA DAVRANIŞI FARKLI, sadece görsel kart paylaşılıyor. Bu farkı
`package-card.tsx`'e bir `action?: ReactNode` slot'u vererek çöz (kart görsel
kısmı ortak, alt aksiyon çağıran taraftan geliyor).

### 12. `studio-client.tsx` bölme — `src/hooks/use-studio-generation.ts`
Mevcut `src/components/studio/studio-client.tsx`'i oku, şu fonksiyonları ve
ilgili state'i yeni hook'a taşı:

**Hook'a TAŞINACAK**: `runGenerate`, `runGenerateSalesSet`,
`runGenerateCreative`, `handleAnalyze` + state: `status`, `result`,
`salesSetResult`, `balance`, `source`, `concepts`.

**Component'te KALACAK**: `template`, `selectedPrompt`, `selectedTitle`,
`customPrompt`, `usingCustom`, `browsingTemplates`, `writingPrompt`,
`browsingSalesSet`, `aspectRatio`, `quality`, `category`, `file`,
`previewUrl` — bunlar "hangi panel aktif" UI durumunu JSX koşullarına ve
controlled input'lara bağlıyor.

Hook imzası: `useStudioGeneration({ file, category, quality, aspectRatio, initialBalance })`
→ `{ status, result, concepts, salesSetResult, balance, busy, runGenerate,
runGenerateSalesSet, runGenerateCreative, handleAnalyze, resetResults }`.

**KRİTİK — DAVRANIŞ BİREBİR KORUNMALI**: toast metinleri (Türkçe string'ler),
kredi kontrol sırası (önce bakiye kontrolü, sonra upload, sonra action
çağrısı), her action'a geçirilen parametreler, hata durumunda status'un
"idle"'a dönmesi — hepsi satır satır aynı kalmalı. Bu saf bir taşıma
(extract), davranış değişikliği DEĞİL. Taşıma sonrası `studio-client.tsx`'in
JSX kısmı (branch mantığı: result → salesSetResult → concepts → template →
writingPrompt → browsingSalesSet → browsingTemplates → StartPanel) AYNEN
kalmalı, sadece fonksiyon çağrıları hook'tan gelen değerlere işaret etsin.

### 13. Route-level loading iskeletleri
`src/app/(app)/dashboard/loading.tsx`, `src/app/(app)/generations/loading.tsx`,
`src/app/(app)/billing/loading.tsx` — mevcut (şu ana kadar hiç kullanılmamış)
`src/components/ui/skeleton.tsx` bileşenini kullanarak her sayfanın gerçek
grid/kart boyutunu taklit eden iskelet. **Madde 7'den (PageHeader/width
kararı) SONRA yap** ki container genişlikleri eşleşsin, layout shift olmasın.
Örnek: dashboard → 3 stat kartı iskeleti + 6'lı grid iskeleti; generations →
4'lü grid iskeleti; billing → 3 paket kartı iskeleti.

## Kabul Kriterleri
- [ ] `pnpm lint` → 0 hata
- [ ] `pnpm exec tsc --noEmit` → 0 hata
- [ ] `pnpm test` → 32/32 yeşil
- [ ] `pnpm build` → temiz (production build; loading.tsx/RSC sınır hataları
      burada yakalanır)
- [ ] Landing sayfası (`/`) gerçek DB paketlerini gösteriyor (billing
      sayfasıyla aynı fiyat/isim/kredi) — tarayıcıda kontrol et
- [ ] `/studio` sayfası (Satış Seti, AI Konsept Öner, Kreatif Üret, Hazır
      Stüdyo, Kendi Prompt akışlarının HEPSİ) hook refactor sonrası ÇALIŞIYOR
      — bu en riskli madde, dikkatli test et (en azından "AI Konsept Öner"
      akışını uçtan uca dene: görsel yükle → analiz → konsept seç → (gerçek
      render tetiklemeden, sadece UI state akışını doğrula, GÖRSEL ÜRETİM
      API'Sİ ÇAĞRILMAZ — bu ayrı ve kesin bir kural, aşağıya bak)
- [ ] Dashboard/generations/billing sayfalarında görsel empty-state/kart
      görünümü ÖNCEKİYLE AYNI (regresyon yok)
- [ ] Küçük, konu-odaklı commit'ler (Türkçe mesaj)

## MUTLAK KURAL — GÖRSEL ÜRETİM API'Sİ
**Nano Banana / Gemini görsel üretim API'sini test amacıyla dahi ASLA
çağırma.** Bu gerçek para harcayan bir işlem, kullanıcının açık onayı
olmadan tetiklenemez. `runGenerate`/`runGenerateSalesSet`/`runGenerateCreative`
fonksiyonlarını hook'a taşırken kod okuyarak/statik analizle doğrula; "Üret"
butonuna gerçekten basıp API'yi tetikleme. UI state akışını (buton
disabled/enabled, panel geçişleri, hata mesajları) görsel üretmeden de test
edebilirsin (ör. "AI Konsept Öner" adımı ücretsizdir/Vision-only, oraya kadar
test edilebilir; asıl render butonuna basma).

## Değişmez Kurallar
1. Backend/Supabase sorgu mantığı, RLS, kredi RPC akışı, Gemini çağrıları DEĞİŞMEZ.
2. Yeni npm bağımlılığı YOK.
3. Base UI `asChild` yok — `render` prop veya `ButtonLink`.
4. Mevcut tasarım dili korunur, yeniden tasarlanmaz.
5. `.env.local` commit'lenmez.

## Bitiş
Dev sunucuyu 3001'de ÇALIŞIR halde bırak — `pnpm build` sonrası `.next`
çakışması riski var (bu projede daha önce yaşandı), build bittikten sonra
`.next` klasörünü silip dev sunucuyu TEMİZ yeniden başlat. Final raporunda:
madde madde değiştirilen/oluşturulan dosyalar, doğrulama çıktıları
(lint/tsc/test/build sonuçları), commit hash'leri, `/studio` akışını nasıl
test ettiğin (hangi adımlara kadar gittiğin, render API'sini tetiklemediğini
nasıl garanti ettiğin).
