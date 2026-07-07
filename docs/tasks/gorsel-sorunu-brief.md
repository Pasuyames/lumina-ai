# Görev Brifi — Görseller Görünmüyor (2 sorun)

> Yürütücü: Sonnet subagent · Tarih: 2026-07-08
> ÇALIŞMA TARZI: YAVAŞ VE DOĞRU. Önce kök nedeni kanıtla, sonra kod yaz.
> Her adımı doğrulamadan sonrakine geçme. Hız değil isabet önceliklidir.

## Bağlam

Proje: Lumina (C:\Users\musta\Desktop\lumina) — AI ürün fotoğrafçılığı SaaS.
Next.js 16 (App Router, Turbopack) + React 19 + TS + Tailwind v4 + Supabase (yerel Docker).
Dev sunucu: **port 3001** (3000'e DOKUNMA — başka projeye ait). `docs/PLAN.md`
tek gerçek kaynak; "Değişmez Kurallar" bölümü sana da aynen geçerlidir.

Ortam ŞU AN AYAKTA: Docker + Supabase (http://127.0.0.1:54321) + `pnpm dev` (3001).
next.config.ts değişikliği gerekirse dev sunucuyu yeniden başlatabilirsin
(PowerShell: `$env:PORT="3001"; pnpm dev`), ama işin bitince MUTLAKA tekrar
çalışır halde bırak.

Test hesabı: admin@lumina.test / lumina123.

## SORUN 1 (asıl bug): Üretilmiş görseller boş kutu olarak görünüyor

**Belirti:** /generations sayfasında ve stüdyo sonuç ekranında kartlar
"Tamamlandı" rozetli ama görsel alanı boş (kırık img, alt metni köşeden taşıyor).

**Yapılmış ön teşhis (kanıtlı — tekrarla ve doğrula):**

1. DB kayıtları sağlam; `result_image_url` değerleri şu formatta:
   `http://127.0.0.1:54321/storage/v1/object/public/product-images/<uid>/results/<uuid>.png`
2. Storage DOĞRUDAN çalışıyor:
   `curl <yukarıdaki-url>` → **200**, image/jpeg, ~2.8MB. Yani dosyalar yerinde.
3. Kırılan katman **next/image optimizer**:
   `GET http://localhost:3001/_next/image?url=<encoded>&w=640&q=75`
   → **400 "url" parameter is not allowed**
4. Oysa `next.config.ts` → `images.remotePatterns` şunu içeriyor:
   `{ protocol: "http", hostname: "127.0.0.1", port: "54321" }`
   Görünüşte doğru ama Next 16 yine de reddediyor.

**Senin işin:** Bu çelişkinin kök nedenini BUL ve KANITLA. Şüpheli alanlar
(sırayla araştır, tahminle kod yazma):
- Next 16'da `images.remotePatterns` davranış değişikliği (ör. `pathname`
  artık zorunlu/varsayılanı değişti mi? `new URL()` formu mu isteniyor?).
  `node_modules/next` içindeki matcher kodunu okuyarak kesinleştir
  (ör. `image-optimizer` / `match-remote-pattern` dosyaları) — dokümantasyon
  tahmini yeterli değil, kodda ne yazıyorsa o.
- Turbopack dev modunda config'in nasıl okunduğu.
- Gerekirse minimal düzeltme örneği: remotePatterns girdilerine açık
  `pathname: "/storage/v1/object/public/**"` eklemek ya da Next 16'nın
  beklediği forma geçmek. AMA önce nedenini kanıtla, sonra en dar düzeltmeyi yap.

**Kabul kriteri (hepsi şart):**
- [ ] `curl "http://localhost:3001/_next/image?url=<encoded-storage-url>&w=640&q=75"` → **200** ve içerik image/*
- [ ] /generations sayfası oturumla açıldığında kartlarda görseller render oluyor
      (doğrulama için storage URL'inin HTML'de/optimizer'da 200 döndüğünü kanıtla;
      tarayıcı açamıyorsan curl ile oturumlu istek at ya da sayfa HTML'ini incele)
- [ ] Kök neden ve düzeltme `docs/PLAN.md`'ye 1-2 satırla işlendi (Faz C altına not)
- [ ] Aynı hatanın PROD'da (https://*.supabase.co) tekrarlamayacağı da düşünüldü —
      cloud pattern'i de aynı düzeltmeyi alsın.

## SORUN 2: Hazır Stüdyo galerisi tamamen boş görünüyor

**Belirti:** /studio "Hazır Stüdyoları Keşfet" ve galeri sayfasındaki 36 şablon
kartının tümü aynı bej kutu + elmas ikonu. Kullanıcıya "boş/yarım ürün" hissi veriyor.

**Neden:** Şablonların `referenceImage` alanı yok — gerçek referans fotoğrafları
üretmek PARALI (C2, kullanıcı onayı bekliyor). Placeholder kasıtlı ama fazla çıplak.

**Senin işin (SIFIR MALİYETLİ çözüm — görsel üretim API'si YASAK):**
Her şablon karta kendine özgü, tasarlanmış görünen bir CSS "sahne önizlemesi" ver:

1. `src/data/templates/types.ts` → `StudioTemplate`'e opsiyonel `preview` alanı:
   ```ts
   /** Referans görsel yokken kartta gösterilen CSS sahne önizlemesi. */
   preview?: { from: string; via?: string; to: string };  // hex renkler
   ```
2. 36 şablonun HER BİRİNE sahnesinin atmosferini yansıtan renkler ata
   (`flagship.ts` + `extended.ts`). Örnekler:
   - "Islak Siyah Mermer" → koyu antrasit→siyah, soğuk
   - "Altın Saten" → amber→altın→krem, sıcak
   - "Buz & Kristal" → buz mavisi→beyaz
   - "Gece Vitrini" → lacivert→mor, şehir ışığı hissi
   Renkleri şablonun `prompt`/`description` içeriğini OKUYARAK seç; rastgele
   dağıtma. Aynı kategorideki kartlar yan yana ayırt edilebilir olmalı.
3. `template-gallery.tsx` TemplateCard: `referenceImage` yoksa ve `preview`
   varsa inline `style` ile `linear-gradient(135deg, from, via?, to)` arka plan +
   mevcut Gem ikonu üstünde kalsın (opaklığı düşür, ör. text-white/25 gibi
   kontrasta göre). `referenceImage` gelirse (C2 sonrası) öncelik onda — mevcut
   davranış bozulmasın.
4. Tailwind'e dinamik class ÜRETME (purge sorunu) — hex değerler inline style ile.

**Kabul kriteri:**
- [ ] Galeri ve stüdyo içi galeri kartları birbirinden ayırt edilebilir, sahneye
      uygun renkli önizlemeler gösteriyor
- [ ] `referenceImage` set edilirse öncelik hâlâ gerçek görselde (regresyon yok)
- [ ] Elle kontrol: en az 5 şablonun rengi sahnesiyle tutarlı mı diye kendin bak

## Değişmez kurallar (docs/PLAN.md §5 — ihlali kabul edilmez)

1. **Görsel üretim API'si (Nano Banana) ASLA çağrılmaz** — gerçek para. Vision da dahil hiçbir Gemini çağrısı yapma; bu görev tamamen yerel/UI işi.
2. `.env.local` commit'lenmez.
3. `src/lib/security/*` ve kredi mantığına (`spend_credits`, actions.ts kredi akışı) DOKUNMA — bu görevin kapsamı değil.
4. UI metinleri ve kod yorumları Türkçe; base-nova preset: `asChild` YOK → `render` prop veya `ButtonLink`.
5. Şablonların `prompt` alanlarını DEĞİŞTİRME — yalnızca `preview` ekle.

## Çalışma disiplini

- Önce SORUN 1'i uçtan uca bitir + doğrula + commit; sonra SORUN 2.
- Küçük, konu-odaklı commit'ler (Türkçe mesaj, mevcut stile bak: `git log --oneline`).
- Bitirmeden önce: `pnpm lint` (0 hata) + `pnpm exec tsc --noEmit` + `pnpm test` (32/32) + `pnpm build` temiz.
- Dev sunucuyu 3001'de ÇALIŞIR halde bırak.
- Bitiş raporunda şunları yaz: kök neden (kanıtıyla), yaptığın değişiklikler
  (dosya dosya), doğrulama çıktıları (curl kodları, test sayısı), commit hash'leri.
