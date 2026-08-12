# Görev Brifi — "Lumina AI Native" Görsel Kimliği Uygulaması

> Yürütücü: Sonnet subagent · Tarih: 2026-07-21
> ÇALIŞMA TARZI: YAVAŞ VE DOĞRU. Her sayfa/bileşen sonrası lint+tsc çalıştır.
> Bu, kullanıcının UZUN bir onay sürecinden sonra kesinleştirdiği bir görsel
> yön değişikliği — yönü SORGULAMA, tam olarak burada tarif edileni uygula.

## Bağlam

Proje: Lumina (C:\Users\musta\Desktop\lumina) — AI ürün fotoğrafçılığı SaaS.
Next.js 16 + React 19 + TS + Tailwind v4 (CSS-first, `src/app/globals.css`) +
shadcn/ui base-nova preset (Base UI — `asChild` YOK, `render` prop veya
`src/components/ui/button-link.tsx` ButtonLink). Bu oturumda daha önce büyük
bir frontend refactor (Faz A/B — mobil nav, PageHeader, EmptyState, Spinner,
Card benimseme, use-studio-generation hook) tamamlandı ve o yapısal iş
KORUNACAK — bu görev sadece GÖRSEL KİMLİĞİ değiştiriyor, bileşen yapısını
(hook'lar, sorgu katmanı, kredi akışı) BOZMAYACAK.

Kullanıcı önceki sıcak/şampanya-altın "lüks butik" temasını kesin bir dille
reddetti ("rezalet olmuş"). Google Stitch (bir AI tasarım aracı) ile 4 farklı
yön denendi; kullanıcı gerçek, saygın ürünlerin (Linear.app, Runway ML,
Raycast, Framer) canlı ekran görüntülerini inceledikten sonra o dile dayanan
4. versiyonu onayladı: **"biraz hoşuma gitti"** — bu YÖN kesinleşti. Referans
görsel projeye kaydedildi: `docs/tasks/lumina-ai-native-reference.png` —
İLK İŞ olarak bu görseli Read tool ile aç ve incele.

Kullanıcının tek eleştirisi: sağdaki eylem listesi satırlarının çoğunda ikon
ve alt açıklama eksikti, çok boş/yarım görünüyordu — bu brif o detayı da
netleştiriyor (madde 5).

## Tasarım Sistemi — "Lumina AI Native"

Referans görselde görüldüğü gibi, Linear/Runway/Raycast/Framer'ın ortak
dilini uygular:

- **Zemin**: saf siyah `#000000`. Panel/kart yüzeyleri bir ton açık:
  `#0D0D0D`–`#111111`.
- **Kenarlıklar**: kıl payı 1px, düşük opasiteli beyaz/gri (~%8-10), ASLA
  parlama/glow efekti yok.
- **TEK vurgu rengi**: sıcak altın `#E8B44A` — SADECE birincil aksiyon
  butonunun dolgusunda ve aktif durumlarda (aktif nav alt çizgisi, seçili
  kategori pili çerçevesi) kullanılır. Büyük yüzeylere YAYILMAZ, glow/aura
  efekti YOK — Raycast'in kırmızısı gibi kesin ve nadir.
- **Tipografi**: Başlıklar İnter Bold/Black ağırlığında, büyük ve kendinden
  emin (Linear'ın dev başlıkları gibi) — serif YOK, "tasarlanmış" bir display
  font YOK. Gövde metni İnter Regular/Medium. Sayısal/teknik etiketler
  (kredi sayısı, çözünürlük) JetBrains Mono.
- **Köşe yuvarlaklığı**: orta (8px civarı), birincil butonlar tam yuvarlak
  (pill).
- **İkonlar**: ince çizgi (1.5px stroke), tek renkli (beyaz/gri), renkli
  değil.
- **Gerçek ürün fotoğrafları her zaman kahraman**: büyük, doğrudan gösterilir,
  UI çerçevesi geri çekilip fotoğrafın parlamasına izin verir.

Bu sistemi `src/app/globals.css`'teki mevcut `@theme inline` OKLCH token'larına
uygula (mevcut champagne-gold paletinin YERİNE — sıcak-gold ismi kalabilir
ama değerler yukarıdaki gibi olacak). `--font-heading` (şu an Playfair
Display) artık İnter'e işaret etmeli veya kaldırılıp doğrudan İnter
kullanılmalı — mevcut `font-heading` class'ı kullanan yerlerde bozulma
olmasın diye class'ı koru, sadece font-family'sini değiştir.

## Kapsam — Uygulanacak Sayfalar/Bileşenler

1. `src/app/globals.css` — token'ları yeni sisteme çevir (renkler, fontlar).
   Gerekirse `src/app/layout.tsx`'e İnter + JetBrains Mono font importları
   ekle (Next font optimizasyonu ile, `next/font/google`).
2. `src/components/site/navbar.tsx` + `mobile-nav.tsx` + `nav-link.tsx` —
   minimal siyah nav, ince tipografi, aktif link altın alt çizgi.
3. `src/components/studio/concept-step.tsx` (StartPanel) — **madde 5'e bak,
   en kritik değişiklik burada**.
4. `src/components/studio/*` diğer bileşenler (render-step, template-gallery,
   sales-set-panel, concept-card) — yeni sisteme renk/kenarlık uyarlaması,
   YAPISINA dokunma.
5. `src/app/(app)/{dashboard,generations,billing}/page.tsx` + `loading.tsx` —
   yeni sisteme uyarlama.
6. `src/app/(marketing)/page.tsx` + `studios/page.tsx` — landing hero, büyük
   cesur başlık, gerçek ürün fotoğrafı vurgusu.
7. `src/app/(auth)/*`, `src/components/auth/auth-form.tsx` — yeni sisteme
   uyarlama.
8. `src/components/ui/*` (button, card, badge, input, page-header,
   empty-state, spinner vb.) — temel bileşenlerin varyantlarını yeni sisteme
   göre güncelle (bunlar merkezi olduğu için önce buraya dokunmak sonraki
   sayfaları kolaylaştırır — muhtemelen İŞE BURADAN BAŞLA).

## Madde 5 — Eylem Listesi Detayı (StartPanel, en kritik düzeltme)

Şu an `concept-step.tsx`'teki `StartPanel` bileşeninde 5 eylem var. Referans
görseldeki gibi HER satır şunları içermeli: sol tarafta küçük ince-çizgi ikon,
ortada iki satırlık metin bloğu (kalın başlık + altında daha küçük gri alt
açıklama), sağda dikeyde ortalanmış chevron/ok. Yeterli dikey padding (satır
başına en az 20px) — önceki Stitch denemelerinde satırlar çok sıkışık/boş
kalmıştı, bunu tekrarlama.

Mevcut ikonlar zaten import edilmiş (`Sparkles, Wand2, ImageIcon, PencilLine,
ShoppingBag, ArrowRight, Shuffle`) — `LayoutGrid` (veya `Grid2x2`) ekle. 5
satır, bu sırayla:

1. İkon `LayoutGrid` — Başlık "Satış Seti Üret" — Alt "Pazaryeri için 4
   görsellik tam paket" — düz kenarlıklı satır.
2. İkon `Shuffle` — "Kreatif Üret" — "Tek tık, sürpriz sonuç" — düz.
3. İkon `ImageIcon` — "Hazır Stüdyoları Keşfet" — "30+ küratörlü sahne" — düz.
4. İkon `PencilLine` — "Kendi Promptunu Yaz" — "Sahneyi kendin tarif et" — düz.
5. İkon `Sparkles` (koyu/siyah renkte) — dolgusu **altın `#E8B44A`**, TEK
   renkli yüzey — "Yapay Zekâ Konsept Önersin" (siyah, kalın) — "Ücretsiz ·
   3 farklı konsept" (koyu/siyah, düşük opasite) — bu satır ekranın en dikkat
   çeken tek elemanı.

**ÖNEMLİ — mevcut fonksiyonelliği KORU:** bu 5 satırın `onClick`/`onSalesSet`/
`onCreative`/`onBrowseTemplates`/`onWritePrompt`/`onAnalyze` prop bağlantıları,
`disabled`/`busy` state mantığı, `hasFile` kontrolü — hiçbiri değişmeyecek,
sadece GÖRSEL/JSX yapısı yenileniyor. `StartPanel`'in mevcut prop imzasına
dokunma.

## Skill'ler — Kullan

Bu oturumda kuruldu, mutlaka faydalan:
- **frontend-design** skill'ini (zaten yüklü) çalışmaya başlamadan önce
  gözden geçir — restraint, tek "imza" öğesi (bu ekranda imza öğesi: altın
  dolgulu tek CTA + büyük gerçek ürün fotoğrafları), erişilebilirlik tabanı
  (klavye focus, `prefers-reduced-motion` saygısı, mobile responsive) ilkeleri
  geçerli.
- **web-design-guidelines** skill'ini işin SONUNDA bir denetim geçişi olarak
  çalıştır (`/web-design-guidelines` veya Skill tool ile) — değiştirdiğin
  sayfaları bu kılavuza göre kontrol et, bulguları düzelt.
- **vercel-react-best-practices** ve **vercel-composition-patterns**
  skill'lerini kod yazarken (özellikle bileşen API'lerini/varyantlarını
  değiştirirken) referans al.

## Değişmez Kurallar

1. Backend/Supabase sorgu mantığı, RLS, kredi RPC akışı, Gemini çağrıları,
   `use-studio-generation.ts` hook'unun mantığı DEĞİŞMEZ — sadece JSX/CSS.
2. Yeni npm bağımlılığı YOK (İnter + JetBrains Mono `next/font/google`
   üzerinden zaten mevcut, ek paket gerekmez).
3. Base UI `asChild` yok — `render` prop veya `ButtonLink`.
4. UI metinleri ve kod yorumları Türkçe.
5. `.env.local` commit'lenmez.
6. Görsel üretim API'si (Nano Banana/Gemini) test için dahi ÇAĞRILMAZ — bu
   görev tamamen frontend/CSS/JSX, hiçbir render action'ı tetiklenmeyecek.

## Doğrulama

- Her sayfa/bileşen grubu sonrası `pnpm lint` + `pnpm exec tsc --noEmit`.
- İşin sonunda tam `pnpm test` (32/32) + `pnpm build`.
- `pnpm build` sonrası `.next` klasörünü sil, dev sunucuyu (`PORT=3001`)
  TEMİZ yeniden başlat (bu projede build+dev çakışması daha önce yaşandı).
- Gerçek tarayıcıda (Playwright varsa) en az `/studio`, `/dashboard`,
  `/` (landing) sayfalarının ekran görüntüsünü al, referans görselle
  (`docs/tasks/lumina-ai-native-reference.png`) karşılaştır — özellikle
  StartPanel eylem listesinin artık ikon+alt metin+düzgün hizalamayla
  göründüğünü GÖRSEL olarak doğrula (sadece kod okuyarak değil).
- `web-design-guidelines` denetiminden geçen bulguları raporla/düzelt.

## Bitiş

Küçük, konu-odaklı commit'ler (Türkçe mesaj, `git log --oneline` ile stile
bak). Dev sunucuyu 3001'de çalışır bırak. Final raporunda: hangi dosyalar
değişti, doğrulama çıktıları, commit hash'leri, StartPanel eylem listesinin
ekran görüntüsü/açıklaması, web-design-guidelines bulguları ve varsa
düzeltmeleri.
