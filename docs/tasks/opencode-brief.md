# OpenCode Görev Brifi — Şablon Kütüphanesi Altyapısı

> Bu brif OpenCode (veya başka bir kod ajanı) için hazırlandı.
> Görevlere başlamadan önce `docs/PLAN.md`'yi oku — proje bağlamı orada.
> Görevleri SIRAYLA yap; her görev sonunda doğrulama koş, ayrı commit at.

## Proje Bağlamı (özet)

Lumina: e-ticaret ürün fotoğraflarını AI ile stüdyo kalitesine çeviren SaaS.
Dizin: `C:\Users\musta\Desktop\lumina`. Next.js 16 App Router + React 19 + TS +
Tailwind v4 + shadcn/ui **base-nova**. Supabase + Gemini. Paket yöneticisi: **pnpm**.

## Değişmez Kurallar (İHLAL ETME)

1. **Gemini/AI API'lerini ASLA çağırma, hiçbir script'i canlı çalıştırma** — gerçek para harcar. Script yazmak serbest, çalıştırmak YASAK.
2. `.env.local`'ı değiştirme ve asla commit'leme. `src/lib/security/`, `src/app/(app)/studio/actions.ts`, `src/app/(auth)/actions.ts`, `src/app/(app)/billing/actions.ts` ve `supabase/` dizinine DOKUNMA.
3. `docs/content/` klasörüne dokunma (başka bir ajan orada içerik yazıyor).
4. shadcn base-nova kullanılıyor: **`asChild` YOKTUR.** Link-buton için `src/components/ui/button-link.tsx` (ButtonLink); menü öğeleri için `render={<Link href={...} />}` deseni.
5. UI metinleri ve kod yorumları TÜRKÇE; şablon `prompt` alanları İNGİLİZCE.
6. Dev sunucusu 3001 portunda zaten çalışıyor — yeni sunucu başlatma.
7. Her görev = ayrı commit; Türkçe mesaj, `feat:`/`refactor:`/`chore:` önekleri.
8. Her görev sonunda: `pnpm lint` + `pnpm exec tsc --noEmit` + `pnpm test` + `pnpm build` dördü de temiz olmalı.

---

## GÖREV 1 — Şablon veri modelini ölçeklenebilir yap

`src/lib/templates.ts` şu an 6 şablonluk sabit dizi. ~150 şablonu taşıyacak
yapıya geçir:

### Yeni şema (birebir bunu kullan — içerik ekibi buna göre yazıyor)

```ts
// src/data/templates/types.ts
import type { ProductCategory } from "@/lib/constants";

export type TemplateTier = "flagship" | "extended" | "seasonal";
export type TemplateSeason =
  | "yilbasi" | "sevgililer-gunu" | "anneler-gunu"
  | "ramazan-bayram" | "black-friday";

export interface StudioTemplate {
  id: string;                      // kebab-case, benzersiz
  title: string;                   // TR — kullanıcı görür
  description: string;             // TR — kullanıcı görür
  bestFor: ProductCategory[];      // hangi kategorilere önerilir
  tags: string[];                  // TR stil etiketleri: "mermer", "dış mekân"…
  tier: TemplateTier;
  season?: TemplateSeason;         // yalnızca tier === "seasonal"
  referenceImage?: string;         // /templates/{id}.webp (public/)
  prompt: string;                  // EN — kullanıcıya GİZLİ render promptu
  sortOrder: number;
}
```

### Yapı

- `src/data/templates/{flagship,extended,seasonal}.ts` — tier başına bir dosya,
  her biri `StudioTemplate[]` export eder. Mevcut 6 şablonu `extended.ts`'e
  birebir taşı (tier: "extended", tags ekle, sortOrder ver). `flagship.ts` ve
  `seasonal.ts` şimdilik BOŞ dizi (içerik ekibi dolduracak).
- `src/data/templates/index.ts` — hepsini birleştirir; export'lar:
  `STUDIO_TEMPLATES` (tümü, sortOrder'a göre), `getTemplateById(id)`,
  `filterTemplates({ category?, tag?, tier?, season?, query? })` (query: title +
  description + tags içinde büyük/küçük harf duyarsız arama; `toLocaleLowerCase("tr")` kullan).
- `src/lib/templates.ts` → geriye dönük uyumluluk için `src/data/templates`'tan
  re-export yapan ince katmana dönüştür (mevcut import'lar kırılmasın), sonra
  tüm import'ları yeni yola taşıyıp bu dosyayı SİL (tercih edilen).
- `src/lib/constants.ts` içindeki `PRODUCT_CATEGORIES`'e yeni kategori ekle:
  `{ value: "beauty", label: "Parfüm & Kozmetik" }` ("other"dan önce).

### Kabul kriteri
Studio akışında şablon seçimi aynen çalışmaya devam etmeli (davranış değişikliği yok),
dört doğrulama komutu temiz.

---

## GÖREV 2 — Galeri UI: kategori filtresi + arama + mevsimsel bölüm

Şablonların listelendiği İKİ yeri bul (herkese açık `/studios` galerisi ve
studio akışındaki şablon seçici) ve şunları ekle:

- **Kategori filtre çipleri**: "Tümü" + PRODUCT_CATEGORIES etiketleri.
  Seçim `filterTemplates`'a gider.
- **Arama kutusu**: anlık metin araması (debounce şart değil, liste küçük).
- **"Sezon" bölümü**: `tier === "seasonal"` şablonlar varsa en üstte ayrı
  başlıkla ("Kampanya Dönemi Stüdyoları") gösterilir; yoksa bölüm hiç render edilmez.
- **Boş durum**: filtre sonucu boşsa "Bu filtreyle eşleşen stüdyo yok" kartı.
- `referenceImage` olmayan şablon kartları mevcut zarif gradyan placeholder'ı
  korusun; olanlar `next/image` ile göstersin (public/ altından, `fill` + `sizes`).
- Filtre state'i client component'te `useState` ile; URL query'ye yazmak İSTEĞE BAĞLI.
- Erişilebilirlik: çipler gerçek `button` + `aria-pressed`; arama input'unun label'ı olsun.

### Kabul kriteri
Mevcut 6 şablonla filtre/arama çalışıyor; görsel stil mevcut tasarım diliyle
uyumlu (bordo/altın lüks his, "AI estetiği" yok); dört doğrulama temiz.

---

## GÖREV 3 — Prompt madencilik script'i (tek seferlik araç)

`scripts/mine-prompts.mjs` yaz:

1. `tmp/` klasörüne (yoksa oluştur; `.gitignore`'a `tmp/` ekle) şu iki repoyu
   `--depth 1` klonlar (zaten varsa `git pull` yerine atlar):
   - https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts (CC BY 4.0)
   - https://github.com/ZeroLu/awesome-nanobanana-pro (CC BY 4.0)
2. README/markdown dosyalarını tarar; içinde şu anahtar kelimelerden en az biri
   geçen prompt bloklarını çıkarır: `product, e-commerce, ecommerce, jewelry,
   watch, bag, perfume, cosmetic, luxury, studio photography, packshot,商品`
   (başlık + prompt metni + kaynak dosya/başlık referansı).
3. Sonucu `data/mined-prompts.json`'a yazar: `[{ source, title, prompt }]`.
   Bu dosya git'e GİRMEZ (`.gitignore`'a `data/mined-prompts.json` ekle) —
   içerik ekibi için hammadde, ürüne otomatik girmeyecek.
4. `docs/ATTRIBUTIONS.md` oluştur: iki repoya CC BY 4.0 atıf notu (repo adı,
   URL, lisans, "prompt kütüphanemizin bir kısmı bu kaynaklardan uyarlanmıştır").

Script'i çalıştırabilirsin (yalnızca git clone + dosya okuma — API çağrısı yok, ücretsiz).

---

## GÖREV 4 — Referans görsel üretim script'i (YAZ ama ÇALIŞTIRMA)

`scripts/generate-template-refs.mjs` yaz. Amaç: her şablonun galeri kartı için
tek örnek render. **Bu script'i sen ASLA çalıştırmayacaksın — gerçek para harcar.**

- Girdi: `src/data/templates` (referenceImage'ı OLMAYAN şablonlar).
- Her şablon için: `scripts/fixtures/{category}.png` içinden şablonun ilk
  `bestFor` kategorisine uygun jenerik ürün görselini alır (fixture yoksa o
  şablonu atlayıp uyarı basar), `@google/genai` ile `GEMINI_IMAGE_MODEL`
  modeline şablon promptu + ürünü gönderir (studio actions'taki
  PRESERVE_INSTRUCTION desenini kopyala), sonucu `public/templates/{id}.webp`
  olarak kaydeder (sharp KULLANMA — yeni bağımlılık ekleme; PNG dönerse
  `{id}.png` kaydet ve şablon verisindeki yolu ona göre bas).
- Güvenlik kilitleri (üçü birden ŞART):
  1. Varsayılan `--dry-run`: ne üretileceğini listeler, API'ye DOKUNMAZ.
  2. Gerçek üretim için `--confirm` bayrağı + `LUMINA_ALLOW_PAID=1` env değişkeni
     ikisi birden gerekli; yoksa hata verip çıkar.
  3. `--limit N` bayrağı (varsayılan 5) — tek seferde en fazla N görsel.
- Her üretim arasında 2 sn bekleme (rate limit nezaketi), toplam maliyet özeti basar.
- Test: yalnızca `--dry-run` modunu çalıştırarak doğrula.

---

## Bitiş Raporu

Dört görev bitince şunları raporla: commit listesi, dört doğrulama komutunun
sonucu, `mine-prompts` kaç prompt çıkardı, atladığın/yorumladığın noktalar.
