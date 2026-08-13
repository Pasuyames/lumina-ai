# Pazarlama Sitesi — Yeni Tasarıma Geçiş

> Tarih: 2026-08-13 · Durum: TAMAMLANDI · Kapsam: `(marketing)` + site geneli
> başlık/altbilgi · Geri dönüş noktası: `acc80cb` commit'i +
> `before-new-design-20260812` tag'i

---

## 1. İş tanımı

Kullanıcı, kendi hazırladığı klon projesini (`C:\Users\musta\Downloads\
9562dwzzz4sg-BottleBeerCorona\Renza New Tasarim`, port 3005) referans tasarım
olarak verdi ve şunları istedi:

1. Tasarımı incele ve Renza'ya geçir.
2. **Hiçbir renk tonuna dokunma.**
3. Ana sayfanın en üstündeki **mavi gökyüzü kapak görselini değiştirme.**
4. Onun önündeki **sürekli dönen kutulara** bizim ürettiğimiz görselleri koy.
5. Genel kural: **sitede görsel gerektiğinde bizim ürettiğimiz görselleri
   kullan.**

Sonraki turlarda eklenenler: animasyonların referanstakiyle birebir çalışması,
üst barın tüm sitede tek tema olması, Stüdyo'daki iki panelin aynı hizada
bitmesi, boş kalan kartlara görsel konması.

---

## 2. Renk paleti (değiştirilmedi)

Referans tasarımın paleti Renza'nın mevcut token'larıyla zaten aynıydı, bu
yüzden `globals.css` içindeki renk değişkenlerine dokunulmadı:

| Rol | Değer |
|---|---|
| `--foreground` / koyu yüzey | `#131313` |
| `--secondary` (lime vurgu) | `#d6fd70` |
| `--primary` (mavi) | `#2453ff` |
| `--muted` / açık gri panel | `#ececec` — bölüm kapsayıcıları `#f2f2f2` ailesinde |
| `--card` | `#ffffff` |

Font: Plus Jakarta Sans (`--font-sans`) + Geist Mono (`--font-mono`, mono
etiketler/CTA'lar için).

---

## 3. Görsel varlıklar — kaynak ve yeniden üretim

**Tüm ürün görselleri Renza Stüdyo'nun gerçek üretimleridir.** Stok fotoğraf,
temsili görsel veya referans şablonun görselleri kullanılmadı. Tek istisna,
kullanıcının açıkça korunmasını istediği hero gökyüzü kapağıdır
(`public/hero-sky.avif`).

### Nereden geldi

Yerel Supabase storage (Docker ayakta olmalı):

```
http://127.0.0.1:61321/storage/v1/object/public/product-images/<path>
```

`path` değerleri `generations` tablosunun `result_image_path` ve
`source_image_path` kolonlarında. Bucket public.

```sql
select id, coalesce(concept_title,'-'), result_image_path, coalesce(source_image_path,'-')
from public.generations
where status = 'completed' and result_image_path is not null
order by created_at desc;
```

### Nasıl işlendi

1. ~33 aday PNG indirildi (2-3 MB/adet).
2. Tek bir kontak baskı (contact sheet) render edilip görsel olarak seçildi —
   tek tek okumak yerine tek karede karşılaştırma.
3. `sharp` ile kırpılıp (`fit: cover`, `position: attention`) webp'ye
   çevrildi ve **statik dosya** olarak `public/showcase/` altına konuldu.

> `sharp` bu projede kurulu DEĞİL. Dönüştürme scripti onu klon projesinin
> `node_modules`'ından mutlak yolla import ederek kullandı. Yeniden gerekirse
> aynı yolu izle veya geçici bir dizinde kur — dev sunucusu çalışırken
> `pnpm add` ÇALIŞTIRMA (Turbopack modül grafiğini bozuyor).

### Sonuç: `public/showcase/` (~1 MB, 30 dosya)

| Dosya | Kullanıldığı yer |
|---|---|
| `hero-1..9.webp` (560×560) | Hero'daki 3B dönen kart çarkı |
| `case-*.webp` (640×854) | "Üretim örnekleri" galerisi (4 dikey kart) |
| `use-*.webp` (800×600) | "Nerede kullanılır" (3 kart) |
| `svc-*.webp` (720×450) | "Stüdyoda neler var" — 6 kartın hepsi |
| `about-cover.webp` (800×1000) | Hakkımızda bento'sundaki büyük kart |
| `cta-cover.webp` (1600×900) | Kapanış CTA arka planı |
| `dokukilidi-before/after.webp` | DokuKilidi öncesi/sonrası — **gerçek bir source→result çifti** |
| `thumb-*.webp` (160×160) | Kare türü küçük resimleri, yörünge rozetleri |

DokuKilidi çifti aynı üretim kaydından geliyor: elde tutulan ham siyah çanta
karesi → mavi ışıklı vitrin sahnesi. Uydurma bir "öncesi/sonrası" değil.

---

## 4. Sayfa haritası ve içerik kaynağı

Referansın bölüm akışı korundu; içerik **gerçek Renza verisiyle** dolduruldu.
Sahte müşteri yorumu, sahte müşteri sayısı, sahte büyüme grafiği ÜRETİLMEDİ.

| # | Bölüm | Referanstaki karşılığı | İçeriğin kaynağı |
|---|---|---|---|
| 1 | Hero | Hero + card wheel | `hero-sky.avif` + 9 gerçek üretim |
| 2 | Kategori şeridi | Logo loop | Desteklenen kategoriler (sahte marka logosu yok) |
| 3 | Hakkımızda | About bento | `STUDIO_TEMPLATES.length` (36), %100 DokuKilidi, 6 üretim yolu, 2K/4K |
| 4 | Stüdyoda neler var | Services | 6 gerçek üretim yolu + kredi maliyetleri |
| 5 | Perde arkası | Expertise (4 kart) | Paket kredileri (DB), `credits.ts` maliyetleri, Satış Seti 4 kare |
| 6 | DokuKilidi | *(referansta yok)* | Gerçek source→result çifti + slider |
| 7 | Üretim örnekleri | Testimonials | **Sahte yorum yerine** 4 gerçek üretim karesi |
| 8 | Fiyatlandırma | Pricing | `packages` tablosundan canlı (₺249 / ₺599 / ₺1.690) |
| 9 | Nerede kullanılır | Blog | 3 kullanım alanı + gerçek üretimler |
| 10 | SSS | *(referansta yok)* | Mevcut FAQ içeriği korundu |
| 11 | Kapanış CTA | CTA | E-posta → `/register` formu |

### Kredi maliyetleri (tek doğruluk kaynağı `src/lib/credits.ts`)

| Adım | Kredi |
|---|---|
| AI Konsept Öner | 0 (ücretsiz) |
| 2K görsel | 1 |
| 4K görsel | 2 |
| Satış Seti (4 kare) | 4 (2K) / 8 (4K) |

Sayfadaki "Üretim başına kredi" sütun grafiği ve kart rozetleri bu değerlerden
türetiliyor. (Bu iş sırasında "Satış Seti = 4 kredi" yazan iki yer, 4K seçimini
göz ardı ettiği için `4-8 kredi` olarak düzeltildi.)

---

## 5. Dosya değişiklikleri

### Yeni

```
public/hero-sky.avif                      mavi gökyüzü kapağı (korunması istenen görsel)
public/showcase/*.webp                    30 üretim görseli

src/components/marketing/
  card-wheel.tsx                          hero'daki 3B dönen kart çarkı (saf CSS animasyon)
  pill-link.tsx                           tek CTA biçimi (mono/uppercase + ok rozeti)
  section-eyebrow.tsx                     bölüm üstü küçük etiket
  animated-number.tsx                     görünüme girince sayan rakam
  animated-progress-bar.tsx               görünüme girince dolan çubuk
  grow-bar-chart.tsx                      görünüme girince kademeli yükselen sütunlar
  orbit-diagram.tsx                       merkez etrafında dönen rozetler

src/components/motion/
  motion-provider.tsx                     site geneli motion politikası (bkz. §7)

src/components/site/
  site-header.tsx                         başlığın sunucu sarmalayıcısı (oturum/kredi/rol)
  site-header-bar.tsx                     başlık (client — kaydırma + hesap menüsü)
  site-footer.tsx                         koyu yuvarlak altbilgi
```

### Değişen

```
src/app/(marketing)/page.tsx              landing tamamen yeniden yazıldı
src/app/(marketing)/layout.tsx            AppShell'e geri döndü (tek tema)
src/app/globals.css                       rz-wheel keyframes; reduced-motion blokları kaldırıldı
src/app/layout.tsx                        MotionProvider eklendi
src/components/motion/fade-up.tsx         useReducedMotion dallanması kaldırıldı (bkz. §7)
src/components/motion/card-reveal.tsx     aynı düzeltme
src/components/motion/floating.tsx        aynı düzeltme
src/components/motion/marquee.tsx         gapClassName prop'u
src/components/site/app-shell.tsx         SiteHeader + SiteFooter
src/components/site/mobile-nav.tsx        props artık yalın değer (loggedIn/email/balance)
src/components/studio/studio-client.tsx   ızgara yeniden kuruldu (bkz. §8)
src/components/studio/upload-step.tsx     lg:contents + açık satır/sütun yerleşimi
src/components/studio/image-dropzone.tsx  className prop + lg'de kapsayıcı yüksekliği
src/lib/supabase/middleware.ts            segment sınırı düzeltmesi (bkz. §8)
```

### Silinen

```
src/components/site/navbar.tsx            SiteHeader ile değiştirildi
src/components/site/nav-link.tsx          artık kullanılmıyor
src/components/site/footer.tsx            SiteFooter ile değiştirildi
```

> Bu üç dosyayı geri EKLEME — iki rakip başlık/altbilgi oluşur.

---

## 6. Animasyonlar

Referanstaki hareketlerin tamamı taşındı:

| Animasyon | Uygulama |
|---|---|
| Hero kart çarkı | Saf CSS `rz-wheel-spin`, 8 kollu 3 çark, 40 sn/tur, `rotateX(-77deg)` ile yatık |
| Kayan şeritler | `rz-marquee-track` (kategori şeridi + kart içi rozet satırları) |
| Bölüm belirmeleri | `FadeUp` (opaklık + yukarı kayma, `whileInView`, bir kez) |
| Sayaçlar | `AnimatedNumber` (IntersectionObserver + rAF) |
| İlerleme çubukları | `AnimatedProgressBar` |
| Büyüyen sütun grafiği | `GrowBarChart` (80 ms kademeli) |
| Yörünge rozetleri | `OrbitDiagram` (rAF, her rozet farklı hızda) |
| Başlığın kaydırınca beyazlaması | `SiteHeaderBar` scroll listener |
| Kart/görsel hover büyümesi | `group-hover:scale-105` |

---

## 7. ÖNEMLİ: hareket azaltma (prefers-reduced-motion) kararı

**Karar: `<MotionConfig reducedMotion="never">` — hareket azaltma tercihi
bilinçli olarak yok sayılıyor.** Site sahibi animasyonların her ziyaretçide
referanstakiyle aynı görünmesini istedi. Aynı nedenle `globals.css`teki
`.rz-wheel` / `.rz-marquee-track` üzerindeki `@media (prefers-reduced-motion:
reduce)` blokları ve `motion-reduce:` yardımcı sınıfları kaldırıldı.
Erişilebilirlik gerekçesiyle kendiliğinden geri ekleme; istenirse
`motion-provider.tsx` içinde tek satırla `"user"`a çevrilir.

**Bundan bağımsız, KALICI kural:** motion bileşenlerinin içinde
`useReducedMotion()` ile **render dallandırması yapma.** Hook sunucuda daima
`false`, istemcide `true` dönebilir; farklı `initial`/`animate` üretince React
hydration uyuşmazlığı oluşuyor ve React inline stilleri düzeltmediği için
("This won't be patched up") sunucudan gelen `opacity: 0` DOM'da **kalıcı**
kalıyor. Sonuç: hareketi azalt açık olan her ziyaretçide sayfa tamamen boş
görünüyordu. Karar her zaman kökteki `MotionConfig`'ten verilir.

Doğrulama yöntemi: `browser.newPage({ reducedMotion: "reduce" })` ile test et.

---

## 8. Yol boyunca bulunan ve düzeltilen ESKİ hatalar

Bu üçü yeni tasarımdan önce de vardı, iş sırasında ortaya çıktı:

1. **`/studios` giriş duvarının arkasındaydı.**
   `src/lib/supabase/middleware.ts` içindeki `PROTECTED_PREFIXES` düz
   `startsWith` ile eşleşiyordu; `"/studio"` öneki herkese açık pazarlama
   sayfası `"/studios"`u da kilitliyordu — landing'in ana CTA'sı oraya gidiyor.
   Segment sınırı kontrolü eklendi (`pathname === p || startsWith(p + "/")`).

2. **Flex kapsayıcıda `mx-auto` daralması.**
   Landing'in kök sarmalayıcısı `flex flex-col` iken, bölümlerdeki `mx-auto`
   flex öğesinde stretch yerine shrink-to-fit tetikliyor ve dar içerikli
   bölümler (SSS gibi) 464 px'e daralıyordu. Kök blok akışına alındı.

3. **Stüdyo'da iki panel aynı hizada bitmiyordu.**
   Sağdaki panel, soldaki **sütunun tamamıyla** (dropzone + kategori seçimi)
   eşitleniyordu, dropzone'un kendisiyle değil → 16 px kayma. Izgara yeniden
   kuruldu: dropzone ile sağ panel artık satır 1'de yan yana, kategori/ek
   açılar satır 2'de yalnızca sol sütunda. `UploadStep` masaüstünde
   `lg:contents` ile ızgaraya açılıyor, `ImageDropzone` da `lg:h-full` ile
   satır yüksekliğini alıyor.

---

## 9. Bilinçli kararlar

- **Sahte içerik üretilmedi.** Referanstaki testimonial bloğu (isim + yorum +
  şirket) ve "5.000+ müşteri / %49 büyüme" tarzı rakamlar taşınmadı; yerlerine
  gerçek üretim kareleri ve doğrulanabilir ürün verisi kondu.
- **Referans şablonun görselleri kopyalanmadı.** Tek istisna, kullanıcının
  korunmasını açıkça istediği hero gökyüzü kapağı.
- **`(app)` ekranlarının iç yapısı değiştirilmedi** — sadece ortak
  başlık/altbilgi ve Stüdyo ızgara hizalaması.
- **Görseller statik dosya olarak taşındı**, localhost storage URL'i
  gömülmedi; prod'a bu haliyle çıkabilir.

---

## 10. Açık işler

- `/studios` galerisindeki 36 şablon kartı hâlâ CSS gradyan önizlemesi
  kullanıyor. Elimizdeki üretimler o şablonlara ait olmadığı için oraya
  rastgele görsel konmadı ("bu şablon bunu üretir" demek yanıltıcı olurdu).
  Her şablon için birer örnek üretilirse `StudioTemplate.referenceImage`
  alanına bağlanabilir.
- Logo (`/renza-logo.png`) mercan-kırmızı raster; mavi hero üzerinde marka
  rengiyle duruyor. Beyaz/tek renk varyant istenirse ayrı bir iş.

---

## 11. Doğrulama

Her turda çalıştırıldı, hepsi temiz:

```
pnpm lint
pnpm exec tsc --noEmit
pnpm test          # 32/32
```

Tarayıcı (Playwright, hem normal hem `reducedMotion: "reduce"`):
1440 px, 1280×720, 390 px mobil + `/`, `/studios`, `/terms`, `/studio`,
`/dashboard` — konsol hatası yok, 4xx yok, yatay taşma yok.

> `pnpm build` bilerek çalıştırılmadı: dev sunucusu ayaktayken build
> Turbopack önbelleğini bozuyor (bkz. proje hafıza notu). Build doğrulaması
> gerekiyorsa önce dev sunucusunu durdur.
