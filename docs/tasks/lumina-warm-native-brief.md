# Görev Brifi — "Lumina Warm Native" Görsel Kimliği (v2 — nihai yön)

> Yürütücü: Sonnet subagent · Tarih: 2026-07-21
> ÇALIŞMA TARZI: YAVAŞ VE DOĞRU. Her sayfa/bileşen sonrası lint+tsc çalıştır.
> Bu, kullanıcının UZUN bir onay sürecinden sonra kesinleştirdiği NİHAİ görsel
> yön. Önceki "siyah+altın" denemesi (varsa working tree'de kalıntı) TERK
> EDİLDİ — eğer commit edilmemiş eski değişiklikler varsa `git status`/`git
> diff` ile kontrol et, çakışıyorsa `git checkout -- .` ile temizle, SIFIRDAN
> bu brife göre başla.

## Bağlam

Proje: Lumina (C:\Users\musta\Desktop\lumina) — AI ürün fotoğrafçılığı SaaS
(takı/saat/çanta/aksesuar satıcıları için). Next.js 16 + React 19 + TS +
Tailwind v4 (CSS-first, `src/app/globals.css`) + shadcn/ui base-nova preset
(Base UI — `asChild` YOK, `render` prop veya `src/components/ui/button-link.tsx`
ButtonLink). Bu oturumda daha önce büyük bir frontend refactor (Faz A/B —
mobil nav, PageHeader, EmptyState, Spinner, Card benimseme,
use-studio-generation hook) tamamlandı ve COMMIT'Lİ — o yapısal iş KORUNACAK,
bu görev sadece GÖRSEL KİMLİĞİ değiştiriyor.

Kullanıcı sıcak/şampanya-altın "lüks butik" temasını reddetti, sonra bir AI
site oluşturucusunda (aura.build) gördüğü, halka açık bir şablonun (herkesin
remixleyebileceği ücretsiz bir galeri şablonu — belirli bir şirkete ait DEĞİL)
genel görsel dilinden ilham almak istedi: krem/beyaz zemin, tek mercan-turuncu
vurgu rengi, dev cesur başlık + bir kelimede italik serif vurgu, pill-şekilli
nav ve butonlar, rozet+başlık+açıklama+ikili-CTA hero düzeni, "güvenilir
markalar" logo şeridi.

**ÇOK ÖNEMLİ — telif/özgünlük kuralı**: O şablonun marka adını ("SprintForge"),
metinlerini, sahte müşteri logolarını KOPYALAMA. Sadece YAPISAL/GÖRSEL
KALIBI (renk paleti, tipografi tavrı, kompozisyon) al; TÜM METİNLER Lumina'ya
özgü YENİDEN YAZILACAK (Türkçe, ürün fotoğrafçılığı bağlamında). Ayrıca o
şablondaki SOYUT 3D poligon hero objesi Lumina'ya ANLAMSIZ — onun yerine
**gerçek, çarpıcı bir ürün fotoğrafını** (yüzük/çanta/saat — projede zaten
örnek görseller var, `public/` klasörüne veya mevcut generations'a bak, yoksa
zarif bir placeholder kompozisyon kullan) yumuşak gölge/çerçeve ile hero
görseli yap; şablondaki "3D obje etrafında süzülen küçük ikon rozetleri"
FİKRİNİ koru (ör. ürün fotoğrafının etrafında küçük "AI" / "60 saniye" /
"DokuKilidi" rozetleri süzülsün).

## Tasarım Sistemi — "Lumina Warm Native"

- **Zemin**: sıcak beyaza yakın krem `#F4F5F5`–`#FAFAFA` (soğuk beyaz DEĞİL,
  hafif sıcak/nötr gri tonu).
- **TEK vurgu rengi**: mercan-turuncu gradyan `#F4785F` → `#E85A3C` — hero
  görselinin çerçeve/gölge/rozet aksanlarında, birincil linklerde, seçili
  state'lerde kullanılır. Büyük düz yüzeylere yayılmaz (sadece hero
  kompozisyonunda gradyan olarak, geri kalanında ince aksan olarak).
- **Metin**: neredeyse siyah `#18181B`.
- **Butonlar**: birincil = dolu siyah pill, beyaz metin. İkincil = beyaz/
  transparan pill, ince gri kenarlık, siyah metin. Nav da beyaz pill
  konteynerde yüzer (zeminden hafif farklı, ince gölge).
- **Tipografi**: Ana başlıklar kalın/geniş bir grotesk sans (Inter Bold/Black
  veya proje zaten yüklüyorsa uygun bir alternatif) — BÜYÜK ölçekte, cesur.
  Başlığın vurgulanan bir kısmı (ör. bir kelime/ifade) İTALİK SERİF ile
  yazılır — projede zaten `Playfair Display` (`--font-heading`) yüklü, onun
  italik ağırlığını bu vurgu için kullan (yeni font yükleme gerekmeyebilir,
  kontrol et). Gövde metni temiz sans (Inter).
- **Köşe yuvarlaklığı**: butonlar/nav tam pill (`rounded-full`), kartlar orta
  yuvarlak (~16-20px, mevcut `rounded-2xl` ile uyumlu).
- **Kompozisyon**: rozet (küçük pill, ikon+metin) → dev başlık (2 satır, son
  kelime/ifade italik serif) → açıklama paragrafı → ikili CTA (siyah dolu +
  beyaz outline) → küçük "güvenilir" satırı → logo/marka şeridi (Lumina için:
  gerçek marka isimleri yerine "500+ satıcı güveniyor" gibi genel bir ifade
  ya da kategori rozetleri (Takı · Saat · Çanta · Aksesuar) kullanılabilir,
  var olmayan şirket adları UYDURMA).

Bu sistemi `src/app/globals.css`'teki `@theme inline` OKLCH token'larına
uygula (mevcut ne varsa üzerine yaz).

## Kapsam — Uygulanacak Sayfalar/Bileşenler

1. `src/app/globals.css` + gerekirse `src/app/layout.tsx` font ayarları —
   önce buradan başla (temel token'lar).
2. `src/app/(marketing)/page.tsx` — **EN KRİTİK, öncelik burada**: hero
   bölümünü yukarıdaki kompozisyona göre YENİDEN YAZ (mevcut 3 adım/
   DokuKilidi/güven bloğu/fiyatlandırma/SSS bölümlerinin İÇERİĞİNİ koru,
   sadece görsel diline uyarla — SIFIRDAN metin uydurma, mevcut Türkçe
   metinleri yeni tipografi/renk sistemine taşı).
3. `src/components/site/{navbar,mobile-nav,nav-link,logo}.tsx` — pill nav.
4. `src/components/ui/{button,card,badge}.tsx` — varyantları yeni sisteme.
5. `src/components/studio/*`, `src/app/(app)/*` sayfaları, `src/app/(auth)/*`
   — yeni renk/tipografi sistemine kademeli uyarlama (yapıya dokunma).

## Değişmez Kurallar

1. Backend/Supabase sorgu mantığı, RLS, kredi RPC akışı, Gemini çağrıları,
   `use-studio-generation.ts` hook mantığı DEĞİŞMEZ — sadece JSX/CSS.
2. Yeni npm bağımlılığı YOK.
3. Base UI `asChild` yok — `render` prop veya `ButtonLink`.
4. UI metinleri ve kod yorumları Türkçe; TÜM metinler orijinal/Lumina'ya özgü
   — başka bir şablonun marka adı/metni/sahte logoları KULLANILMAZ.
5. `.env.local` commit'lenmez.
6. Görsel üretim API'si (Nano Banana/Gemini) test için dahi ÇAĞRILMAZ.

## Skill'ler

Bu oturumda kuruldu, kullan: **frontend-design** (başlamadan önce gözden
geçir — restraint, imza öğesi ilkeleri), **web-design-guidelines** (sonda
denetim), **vercel-react-best-practices** + **vercel-composition-patterns**
(kod yazarken).

## Doğrulama

- Her grup sonrası `pnpm lint` + `pnpm exec tsc --noEmit`.
- Sonunda `pnpm test` (32/32) + `pnpm build`; build sonrası `.next` silinip
  dev sunucu (`PORT=3001`) TEMİZ yeniden başlatılacak.
- Playwright ile `/` (landing), `/studio`, `/dashboard` ekran görüntüsü al,
  görsel olarak doğrula (kod okuyarak değil).
- `web-design-guidelines` denetiminden geç, bulguları düzelt.

## Bitiş

Küçük, konu-odaklı Türkçe commit'ler. Dev sunucuyu 3001'de çalışır bırak.
Final raporda: değişen dosyalar, doğrulama çıktıları, commit hash'leri,
landing hero'nun ekran görüntüsü, web-design-guidelines bulguları.
