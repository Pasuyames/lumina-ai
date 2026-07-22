import {
  ArrowRight,
  Upload,
  Wand2,
  Sparkles,
  Gem,
  Check,
  ShieldCheck,
  Infinity as InfinityIcon,
  EyeOff,
  Zap,
  LayoutGrid,
  Shuffle,
  ImageIcon,
  PencilLine,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";
import { PackageCard } from "@/components/billing/package-card";
import { ROUTES } from "@/lib/constants";
import { STUDIO_TEMPLATES } from "@/lib/templates";
import { getActivePackages } from "@/lib/queries";
import { cn } from "@/lib/utils";

const HERO_CATEGORIES = ["Takı", "Saat", "Çanta", "Aksesuar", "Parfüm"];

const STEPS = [
  {
    icon: Upload,
    title: "Yükle",
    desc: "Telefonla çekilmiş sade bir ürün fotoğrafı yeterli.",
  },
  {
    icon: Wand2,
    title: "Konsept Seç",
    desc: "Yapay zekâ ürünü analiz eder, lüks stüdyo konseptleri önerir.",
  },
  {
    icon: Sparkles,
    title: "İndir",
    desc: "Ürünün şekli korunur; arka plan, ışık ve yansıma yeniden üretilir.",
  },
];

const CAPABILITIES = [
  {
    icon: LayoutGrid,
    title: "Satış Seti",
    desc: "Pazaryeri ana görseli, model üstünde, detay ve vitrin karesi — tek tıkla 4 görsel.",
    badge: "4 kredi",
  },
  {
    icon: Wand2,
    title: "AI Konsept Öner",
    desc: "Ürününüzü analiz eder, birbirinden farklı 3 lüks stüdyo konsepti sunar.",
    badge: "Ücretsiz",
  },
  {
    icon: Shuffle,
    title: "Kreatif Üret",
    desc: "Hiçbir şey seçmeden tek tıkla cüretkâr, sürpriz bir sahne üretilir.",
    badge: "1 kredi",
  },
  {
    icon: ImageIcon,
    title: "Hazır Stüdyolar",
    desc: "30'dan fazla küratörlü sahneden birini seçin, ürününüz anında oraya taşınsın.",
    badge: "1 kredi",
  },
  {
    icon: PencilLine,
    title: "Kendi Promptunuz",
    desc: "Hayalinizdeki sahneyi birkaç cümleyle anlatın, ürününüz o sahneye taşınsın.",
    badge: "1 kredi",
  },
  {
    icon: Sparkles,
    title: "2K / 4K Kalite",
    desc: "İhtiyacınıza göre standart veya yüksek çözünürlükte üretim yapın.",
    badge: "1-2 kredi",
  },
];

const TRUST_POINTS = [
  {
    icon: InfinityIcon,
    title: "Krediler asla sona ermez",
    desc: "Bu ay kullanmadığınız krediler gelecek aya aynen taşınır.",
  },
  {
    icon: ShieldCheck,
    title: "Otomatik yenileme yok",
    desc: "Abonelik değil, tek seferlik paket satın alımı. İstediğinizde alırsınız.",
  },
  {
    icon: EyeOff,
    title: "Gizli ücret yok",
    desc: "Gördüğünüz fiyat ödediğiniz fiyattır — kurulum ya da işlem ücreti eklenmez.",
  },
];

const FAQ = [
  {
    q: "Kredi sistemi nasıl çalışır?",
    a: "Her paket belirli sayıda görsel hakkı (kredi) içerir. 2K bir görsel 1 kredi, 4K bir görsel 2 kredi harcar. Kredi yalnızca üretim başarılı olduğunda düşer.",
  },
  {
    q: "Ürettiğim görsellerin hakları bana mı ait?",
    a: "Evet. Oluşturduğunuz tüm görselleri ticari amaçlarla (ürün sayfası, sosyal medya, reklam) sınırsız kullanabilirsiniz.",
  },
  {
    q: "Hangi ürün kategorilerini destekliyorsunuz?",
    a: "Takı, saat, çanta, aksesuar, parfüm ve kozmetik ürünleri için özel olarak kalibre edilmiş sahneler sunuyoruz. Diğer küçük ürünler için de deneme yapabilirsiniz.",
  },
  {
    q: "Bir görsel üretimi ne kadar sürer?",
    a: "Ortalama 10-20 saniye. Yoğun saatlerde bu süre biraz uzayabilir, ancak her zaman dakikalar içinde sonuç alırsınız.",
  },
  {
    q: "Üretim başarısız olursa kredim gider mi?",
    a: "Hayır. Kredi yalnızca başarılı bir üretim tamamlandığında düşer. Bir hata oluşursa bakiyeniz aynen korunur.",
  },
  {
    q: "2K ile 4K arasındaki fark nedir?",
    a: "4K, daha yüksek çözünürlükte ve daha fazla detayla üretim yapar; büyük baskı veya yakın çekim vitrin görselleri için önerilir. 2K çoğu e-ticaret kullanımı için yeterlidir ve 1 kredi tutar.",
  },
];

export default async function LandingPage() {
  const packages = await getActivePackages();

  return (
    <div className="flex flex-col">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pb-8 pt-20 sm:pt-28">
        <div
          aria-hidden
          className="coral-glow pointer-events-none absolute -right-20 top-0 -z-10 h-[560px] w-[560px]"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-4">
          {/* Metin — masaüstünde sola yaslı, mobilde ortalanmış */}
          <div className="text-center lg:text-left">
            <Badge
              variant="outline"
              className="mb-6 gap-1.5 border-border bg-card px-3 py-1 shadow-sm"
            >
              <Gem className="size-3.5 text-primary" />
              Takı · Saat · Çanta için tasarlandı
            </Badge>
            <h1 className="font-heading text-balance text-5xl font-extrabold leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
              Telefon çekiminden
              <br />
              <span className="font-accent text-primary">stüdyo kalitesine</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground lg:mx-0">
              60 saniyede, tek fotoğraftan profesyonel ürün çekimi.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <ButtonLink href={ROUTES.register} size="lg" className="gap-2">
                Ücretsiz Dene — 3 görsel hediye <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href={ROUTES.gallery} size="lg" variant="outline">
                Stüdyoları Keşfet
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong className="text-foreground">Kart bilgisi gerekmez.</strong>
            </p>
          </div>

          {/* Hero görseli — başlığın yanında/arkasında taşan faset obje;
              projede gerçek ürün fotoğrafı bulunmadığı için (bkz. brief)
              soyut kompozisyon + süzülen rozetler kullanıldı. */}
          <div className="relative mx-auto flex h-[360px] w-full max-w-md items-center justify-center sm:h-[440px] lg:mx-0 lg:h-[520px] lg:max-w-none lg:justify-end">
            <FacetedGem className="h-56 w-56 sm:h-72 sm:w-72 lg:h-96 lg:w-96 lg:translate-x-10" />

            <FloatingBadge
              icon={<Sparkles className="size-3.5" />}
              label="AI destekli"
              className="left-[2%] top-[10%] -rotate-3 sm:left-[8%]"
            />
            <FloatingBadge
              icon={<Zap className="size-3.5" />}
              label="60 saniye"
              className="right-[4%] top-[6%] rotate-2 lg:right-[14%]"
            />
            <FloatingBadge
              icon={<ShieldCheck className="size-3.5" />}
              label="DokuKilidi"
              className="bottom-[8%] left-[6%] rotate-2 sm:left-[10%]"
            />
          </div>
        </div>

        {/* Kategori şeridi — sahte marka/logo yok, sadece desteklenen kategoriler */}
        <div className="mx-auto mt-14 max-w-3xl px-4 text-center sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Şunlar için tasarlandı
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm font-medium text-muted-foreground/80">
            {HERO_CATEGORIES.map((c, i) => (
              <span key={c} className="flex items-center gap-x-2">
                {i > 0 && <span aria-hidden>·</span>}
                <span>{c}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            Nasıl çalışır
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="relative p-6">
              <span className="font-heading absolute right-5 top-4 text-4xl font-semibold text-muted/40">
                0{i + 1}
              </span>
              <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <s.icon className="size-5" />
              </span>
              <h3 className="font-heading mt-4 text-lg font-medium">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── YETENEKLER ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-xl">
          <p className="text-sm font-semibold text-primary">Stüdyoda neler var</p>
          <h2 className="font-heading mt-2 text-2xl font-semibold sm:text-3xl">
            Tek bir fotoğraftan altı farklı yol.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Her üretim yalnızca başarılı olduğunda kredi harcar; hangi yolu
            seçerseniz seçin ürününüzün gerçekliği DokuKilidi ile korunur.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <Card key={c.title} className="p-6">
              <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <c.icon className="size-5" />
              </span>
              <h3 className="font-heading mt-4 text-base font-medium">
                {c.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
              <Badge variant="secondary" className="mt-4 text-xs">
                {c.badge}
              </Badge>
            </Card>
          ))}
        </div>
      </section>

      {/* ── RAKAMLARLA ── */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-accent/40 p-8 sm:p-12">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:-space-x-4">
            <div className="flex-1 rounded-full border border-border bg-card px-8 py-6 text-center shadow-sm sm:rotate-[-1deg]">
              <p className="font-heading text-4xl font-semibold sm:text-5xl">
                60 <span className="text-primary">saniye</span>
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                ortalama üretim süresi
              </p>
            </div>
            <div className="flex-1 rounded-full border border-border bg-card px-8 py-6 text-center shadow-md sm:z-10 sm:scale-105">
              <p className="font-heading text-4xl font-semibold sm:text-5xl">
                3 <span className="text-primary">görsel</span>
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                kayıt olunca hediye
              </p>
            </div>
            <div className="flex-1 rounded-full border border-border bg-card px-8 py-6 text-center shadow-sm sm:rotate-[1deg]">
              <p className="font-heading text-4xl font-semibold sm:text-5xl">
                6 <span className="text-primary">yol</span>
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                her ürüne uygun üretim seçeneği
              </p>
            </div>
          </div>
          <p className="relative mt-8 text-center text-xs text-muted-foreground">
            Ortalama süre yoğun saatlerde uzayabilir; kredi yalnızca başarılı
            üretimde düşer.
          </p>
        </div>
      </section>

      {/* ── DOKUKİLİDİ ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" /> DokuKilidi
              Teknolojisi
            </Badge>
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              DokuKilidi Teknolojisi
            </h2>
            <p className="mt-3 text-muted-foreground">
              Ürününüzün şekli, rengi ve dokusu piksel piksel korunur; yalnızca
              sahne değişir.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                Ürün geometrisi ve orantıları bozulmadan kalır
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                Malzeme, renk ve doku aynen korunur
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                Yalnızca arka plan, ışık ve yansımalar yeniden üretilir
              </li>
            </ul>
          </div>
          <BeforeAfterSlider
            beforeSrc="/examples/dokukilidi-before.jpg"
            afterSrc="/examples/dokukilidi-after.jpg"
            beforeAlt="Ham telefon çekimi"
            afterAlt="DokuKilidi ile stüdyo görseli"
          />
        </div>
      </section>

      {/* ── NASIL ÇALIŞTIĞIMIZ (koyu bento) ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-xl">
          <p className="text-sm font-semibold text-primary">Perde arkası</p>
          <h2 className="font-heading mt-2 text-2xl font-semibold sm:text-3xl">
            Tek akış, tek ekran.
          </h2>
        </div>

        <div className="rounded-[2.25rem] bg-[#171512] p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Büyük panel 1: tek akış */}
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/5 bg-[#1f1c17] p-8 sm:p-10 lg:col-span-2">
              <h3 className="text-2xl font-semibold text-white sm:text-3xl">
                Tek ekranda <span className="text-white/50">baştan sona</span>
              </h3>
              <p className="mt-3 max-w-md text-base leading-relaxed text-white/55">
                Yükleyin, sahneyi seçin, indirin — ayrı bir düzenleme aracına ya
                da tasarımcıya gerek kalmadan hepsi Stüdyo&apos;da.
              </p>
              <div className="mt-10 flex items-center justify-center gap-3">
                <div className="flex items-center">
                  <div className="h-24 w-16 -rotate-6 rounded-2xl border border-white/5 bg-[#26221c]" />
                  <div className="-ml-8 h-28 w-20 -rotate-3 rounded-2xl border border-white/10 bg-[#2c2820]" />
                  <div className="relative z-10 -ml-8 flex h-32 w-24 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-b from-[#332d24] to-[#211d17] shadow-[0_20px_40px_-14px_rgba(0,0,0,0.7)]">
                    <Upload className="size-7 text-white/70" strokeWidth={1.5} />
                  </div>
                </div>
                <span className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-[#171512] text-primary">
                  <ArrowRight className="size-4" />
                </span>
                <div className="relative flex h-32 w-24 items-center justify-center rounded-2xl border border-primary/25 bg-gradient-to-b from-[#3a2018] to-[#2a150f]">
                  <Sparkles className="size-7 text-primary" strokeWidth={1.5} />
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-lg">
                    Hazır
                  </span>
                </div>
              </div>
            </div>

            {/* Küçük panel: kredi verimliliği */}
            <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-white/5 bg-[#1f1c17] p-8">
              <span className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-[0_12px_24px_-8px_rgba(232,90,60,0.6)]">
                1 kredi&apos;den başlar
              </span>
              <div className="mt-6 flex items-end gap-2.5">
                <span className="h-8 w-5 rounded-full bg-white/10" />
                <span className="h-14 w-5 rounded-full bg-gradient-to-b from-primary to-[#c94d2c]" />
                <span className="h-10 w-5 rounded-full bg-white/10" />
                <span className="h-20 w-5 rounded-full bg-white/15" />
                <span className="h-6 w-5 rounded-full bg-white/10" />
              </div>
              <p className="mt-6 text-center text-sm text-white/50">
                2K bir görsel 1, 4K bir görsel 2 kredi tutar
              </p>
            </div>

            {/* Küçük panel: kullanım hakkı */}
            <div className="rounded-[1.75rem] border border-white/5 bg-[#1f1c17] p-8">
              <span className="grid size-12 place-items-center rounded-full border border-primary/30 bg-[#2a150f] text-primary">
                <ShieldCheck className="size-5" strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 text-2xl font-semibold text-white">
                Sınırsız <span className="text-white/50">kullanım hakkı</span>
              </h3>
              <p className="mt-2 text-base leading-relaxed text-white/55">
                Ürettiğiniz her görsel size ait — ürün sayfası, sosyal medya ya
                da reklamda dilediğinizce kullanın.
              </p>
            </div>

            {/* Büyük panel 2: stüdyo ihtiyacını ortadan kaldırma */}
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/5 bg-[#1f1c17] p-8 sm:p-10 lg:col-span-2">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
                <div className="relative shrink-0">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -left-5 -top-5 h-3 w-3 rounded-full bg-primary/70"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-4 left-16 h-2 w-2 rounded-full bg-primary/40"
                  />
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_14px_28px_-10px_rgba(232,90,60,0.8)]">
                    <Gem className="size-4" strokeWidth={1.5} />
                    Telefon → Vitrin
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    Stüdyo <span className="text-white/50">kirası yok</span>
                  </h3>
                  <p className="mt-2 max-w-md text-base leading-relaxed text-white/55">
                    Fotoğrafçı randevusu, ekipman ya da stüdyo kirası olmadan —
                    telefonunuzdaki fotoğraf yeterli başlangıç noktası.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HAZIR STÜDYOLAR ÖNİZLEME ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              İlham Galerisi
            </h2>
            <p className="mt-1 text-muted-foreground">
              Hazır stüdyo şablonlarından birini seçin, ürününüz anında o sahneye
              taşınsın.
            </p>
          </div>
          <ButtonLink
            href={ROUTES.gallery}
            variant="ghost"
            className="hidden gap-1 sm:flex"
          >
            Tümü <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {STUDIO_TEMPLATES.slice(0, 12).map((t) => (
            <div
              key={t.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-gradient-to-br from-accent/60 to-muted"
            >
              <div className="absolute inset-0 grid place-items-center text-primary/30">
                <Gem className="size-8" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-3">
                <p className="font-heading text-sm font-medium">{t.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── GÜVEN BLOĞU ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {TRUST_POINTS.map((t) => (
            <Card key={t.title} className="p-6">
              <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <t.icon className="size-5" />
              </span>
              <h3 className="font-heading mt-4 text-base font-medium">
                {t.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── FİYATLANDIRMA ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            Basit, kredili fiyatlandırma
          </h2>
          <p className="mt-2 text-muted-foreground">
            2K görsel 1 kredi, 4K görsel 2 kredi. Kullandıkça öde, abonelik yok.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              action={
                <ButtonLink
                  href={ROUTES.register}
                  className="w-full"
                  variant={pkg.is_popular ? "default" : "outline"}
                >
                  Başla
                </ButtonLink>
              }
            />
          ))}
        </div>
      </section>

      {/* ── SSS ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            Sıkça sorulan sorular
          </h2>
        </div>
        <div className="mx-auto max-w-2xl divide-y divide-border rounded-2xl border border-border">
          {FAQ.map((item) => (
            <details key={item.q} className="group p-5 open:bg-accent/20">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-medium">
                {item.q}
                <ArrowRight
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
                />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── KAPANIŞ CTA ── */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6">
        <Card className="relative overflow-hidden border-border p-10 text-center sm:p-16">
          <div
            aria-hidden
            className="coral-glow pointer-events-none absolute -left-32 -top-24 h-72 w-72 opacity-60"
          />
          <h2 className="font-heading relative mx-auto max-w-2xl text-3xl font-extrabold leading-tight text-balance sm:text-5xl">
            Ürününüzü <span className="font-accent text-primary">bugün</span>{" "}
            stüdyo kalitesinde görün.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-pretty text-muted-foreground">
            E-postanızı bırakın, hesabınız hazır olsun — ilk 3 görsel bizden.
          </p>

          <form
            action={ROUTES.register}
            method="GET"
            className="relative mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
          >
            <Label htmlFor="cta-email" className="sr-only">
              E-posta adresiniz
            </Label>
            <Input
              id="cta-email"
              name="email"
              type="email"
              placeholder="siz@markaniz.com"
              className="h-12 flex-1 rounded-full bg-card px-6"
            />
            <Button type="submit" size="lg" className="gap-2">
              Ücretsiz Başla <ArrowRight className="size-4" />
            </Button>
          </form>
          <p className="relative mt-4 text-sm text-muted-foreground">
            Kart bilgisi gerekmez · 60 saniyede ilk göseliniz hazır
          </p>
        </Card>
      </section>
    </div>
  );
}

/** Hero görselinin etrafında süzülen küçük özellik rozeti. */
function FloatingBadge({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "absolute hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-md sm:inline-flex",
        className,
      )}
    >
      <span className="text-primary">{icon}</span>
      {label}
    </span>
  );
}

/**
 * Hero'nun merkezindeki çok yüzeyli (faceted) mercan-turuncu obje — Lumina'nın
 * "ışığı yakalayan yüzey" fikrini (DokuKilidi: ürünün dokusu/parlaklığı
 * korunur) somutlaştıran orijinal bir SVG kompozisyon. Altıgen bir gövdeyi
 * merkezden 6 üçgen faseta bölüp her birine ayrı bir ton vererek, tek bir
 * ışık kaynağının (sağ üst) yüzeylere farklı düştüğü izlenimi verir —
 * mücevher kesimindeki faset mantığının soyutlanmış hali.
 */
function FacetedGem({ className }: { className?: string }) {
  return (
    <div className={cn("gem-stage relative", className)}>
      {/* Zemine oturan yumuşak gölge — objenin havada değil, bir yüzeyde
          durduğu hissini verir (perspective ile birlikte "vitrin" etkisi). */}
      <div
        aria-hidden
        className="absolute inset-x-[15%] bottom-[6%] h-[10%] rounded-[50%] bg-foreground/15 blur-md"
      />
      <svg
        viewBox="0 0 300 300"
        className="gem-showcase relative h-full w-full drop-shadow-[0_25px_35px_rgba(201,77,44,0.35)]"
        role="img"
        aria-label="Çok yüzeyli mercan-turuncu obje"
      >
        <polygon points="150,150 215,37.4 280,150" fill="#FDC3AE" />
        <polygon points="150,150 85,37.4 215,37.4" fill="#F4785F" />
        <polygon points="150,150 20,150 85,37.4" fill="#EE6D53" />
        <polygon points="150,150 85,262.6 20,150" fill="#E85A3C" />
        <polygon points="150,150 215,262.6 85,262.6" fill="#D14E33" />
        <polygon points="150,150 280,150 215,262.6" fill="#C94D2C" />
        {/* İnce iç çizgiler — her faseti ayrı bir yüzey gibi vurgular. */}
        <polygon
          points="150,150 215,37.4 280,150 215,262.6 85,262.6 20,150 85,37.4"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.3"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Üst fasette küçük bir parıltı — ışığın direkt vurduğu izlenimi. */}
        <polygon
          points="150,150 215,37.4 245,93.7"
          fill="#ffffff"
          fillOpacity="0.35"
        />
      </svg>
    </div>
  );
}
