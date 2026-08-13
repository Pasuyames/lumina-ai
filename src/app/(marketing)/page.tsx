import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  EyeOff,
  Gem,
  Image as ImageIcon,
  Infinity as InfinityIcon,
  LayoutGrid,
  PencilLine,
  ShieldCheck,
  Shuffle,
  Sparkles,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { PillLink } from "@/components/marketing/pill-link";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";
import { CardWheel, type WheelGroup } from "@/components/marketing/card-wheel";
import { AnimatedNumber } from "@/components/marketing/animated-number";
import { AnimatedProgressBar } from "@/components/marketing/animated-progress-bar";
import { GrowBarChart } from "@/components/marketing/grow-bar-chart";
import { OrbitDiagram } from "@/components/marketing/orbit-diagram";
import { FadeUp } from "@/components/motion/fade-up";
import { Marquee } from "@/components/motion/marquee";
import { BeforeAfterSlider } from "@/components/ui/before-after-slider";
import { ROUTES } from "@/lib/constants";
import { STUDIO_TEMPLATES } from "@/lib/templates";
import { getActivePackages } from "@/lib/queries";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

/**
 * Hero'daki dönen üç kart çarkı. Görsellerin hepsi Renza Stüdyo'nun
 * ürettiği gerçek karelerden — stok fotoğraf veya temsili görsel yok.
 */
const WHEEL_GROUPS: WheelGroup[] = [
  {
    images: ["/showcase/hero-1.webp", "/showcase/hero-4.webp", "/showcase/hero-7.webp"],
    baseRotate: -15,
  },
  {
    images: ["/showcase/hero-2.webp", "/showcase/hero-5.webp", "/showcase/hero-8.webp"],
    baseRotate: -30,
  },
  {
    images: ["/showcase/hero-3.webp", "/showcase/hero-6.webp", "/showcase/hero-9.webp"],
    baseRotate: 0,
  },
];

const HERO_PROOF = [
  "Krediler sona ermez",
  "Abonelik yok",
  "Gizli ücret yok",
];

const CATEGORIES = [
  "Takı",
  "Saat",
  "Çanta",
  "Aksesuar",
  "Parfüm",
  "Kozmetik",
  "Ayakkabı",
  "Gözlük",
];

const CAPABILITIES = [
  {
    icon: LayoutGrid,
    title: "Satış Seti",
    desc: "Pazaryeri ana görseli, model üstünde, detay ve vitrin karesi — tek tıkla dört görsel.",
    badge: "4-8 kredi",
    image: "/showcase/svc-detay.webp",
  },
  {
    icon: Wand2,
    title: "AI Konsept Öner",
    desc: "Ürününüzü analiz eder, birbirinden farklı üç lüks stüdyo konsepti sunar.",
    badge: "Ücretsiz",
    image: "/showcase/svc-konsept.webp",
  },
  {
    icon: Shuffle,
    title: "Kreatif Üret",
    desc: "Hiçbir şey seçmeden tek tıkla cüretkâr, sürpriz bir sahne üretilir.",
    badge: "1 kredi",
    image: "/showcase/svc-kreatif.webp",
  },
  {
    icon: ImageIcon,
    title: "Hazır Stüdyolar",
    desc: `${STUDIO_TEMPLATES.length} küratörlü sahneden birini seçin, ürününüz anında oraya taşınsın.`,
    badge: "1 kredi",
    image: "/showcase/svc-hazir.webp",
  },
  {
    icon: PencilLine,
    title: "Kendi Promptunuz",
    desc: "Hayalinizdeki sahneyi birkaç cümleyle anlatın, ürününüz o sahneye taşınsın.",
    badge: "1 kredi",
    image: "/showcase/svc-prompt.webp",
  },
  {
    icon: Sparkles,
    title: "2K / 4K Kalite",
    desc: "İhtiyacınıza göre standart veya yüksek çözünürlükte üretim yapın; 4K, yakın çekim detaylarını taşır.",
    badge: "1-2 kredi",
    image: "/showcase/svc-makro.webp",
  },
];

/**
 * "Üretim başına kredi" sütun grafiği. Değerler `src/lib/credits.ts`teki
 * gerçek maliyetlerden geliyor (2K=1, 4K=2, Satış Seti = 4 kare × kare
 * maliyeti) ve en pahalı adım olan 8 krediye göre normalize edildi.
 */
const CREDIT_BARS = [
  { label: "Öneri", value: 0 },
  { label: "2K", value: 1 / 8 },
  { label: "4K", value: 2 / 8 },
  { label: "Set 2K", value: 4 / 8 },
  { label: "Set 4K", value: 1, highlighted: true },
];

/** Satış Seti'nin ürettiği dört kare — Stüdyo'daki gerçek kare adları. */
const SHOT_TYPES = [
  { label: "Ana Görsel", thumb: "/showcase/thumb-ana.webp" },
  { label: "Model Üstünde", thumb: "/showcase/thumb-model.webp" },
  { label: "Detay Çekimi", thumb: "/showcase/thumb-detay.webp" },
  { label: "Vitrin Sahnesi", thumb: "/showcase/thumb-vitrin.webp" },
];

const SHOWCASE = [
  {
    src: "/showcase/case-gozluk-model.webp",
    shot: "Model Üstünde",
    caption: "Güneş gözlüğü, doğal ışıkta editoryal bir portre karesine taşındı.",
  },
  {
    src: "/showcase/case-bileklik-model.webp",
    shot: "Model Üstünde",
    caption: "Taşlı bileklik, bilek üzerinde yumuşak stüdyo ışığıyla çekildi.",
  },
  {
    src: "/showcase/case-kolye-model.webp",
    shot: "Kullanım Anı",
    caption: "Altın kolye, sıcak tonlu bir moda çekimi kurgusunda.",
  },
  {
    src: "/showcase/case-ayakkabi-vitrin.webp",
    shot: "Vitrin Sahnesi",
    caption: "Ayakkabı, traverten bir podyum üzerinde vitrin sahnesine taşındı.",
  },
];

const USE_CASES = [
  {
    image: "/showcase/use-pazaryeri.webp",
    title: "Pazaryeri ilanları",
    desc: "Trendyol, Hepsiburada ve kendi mağazanız için tek tip, temiz ana görseller.",
  },
  {
    image: "/showcase/use-sosyal.webp",
    title: "Sosyal medya içeriği",
    desc: "Instagram ve TikTok akışına uygun, sahne kurgusu güçlü kareler.",
  },
  {
    image: "/showcase/use-reklam.webp",
    title: "Reklam görselleri",
    desc: "Kampanya ve katalog için model üstünde çekilmiş editoryal görseller.",
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
  const maxCredits = Math.max(1, ...packages.map((p) => p.credits));

  // NOT: kök sarmalayıcı blok akışında kalmalı — `flex flex-col` verilirse
  // bölümlerdeki `mx-auto`, flex öğesinde stretch yerine shrink-to-fit
  // davranışı tetikleyip dar içerikli bölümleri (SSS gibi) daraltıyor.
  return (
    <div className="bg-card">
      {/* ── HERO ─────────────────────────────────────────────────────────
          Tam ekran mavi gökyüzü kapağı; ortada başlık/CTA, altında sürekli
          dönen üç kart çarkı (içindeki her kare gerçek bir Renza üretimi). */}
      <section className="relative h-screen min-h-[850px] overflow-hidden">
        <Image
          src="/hero-sky.avif"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-x-0 top-24 bottom-0 z-10 mx-auto flex max-w-3xl flex-col items-center justify-center px-6 text-center">
          <FadeUp immediate>
            <h1 className="text-[38px] font-medium leading-[1.15] tracking-[-0.06em] text-white sm:text-[52px] sm:leading-[1.1] lg:text-[60px] lg:leading-[1.2]">
              Telefon çekiminden{" "}
              <span className="text-white/70">stüdyo kalitesine</span>
            </h1>
          </FadeUp>

          <FadeUp immediate delay={0.12}>
            <p className="mt-6 max-w-xl text-base text-white/90 sm:text-lg">
              Ürününüzün tek bir fotoğrafını yükleyin; saniyeler içinde satışa
              hazır, profesyonel bir ürün çekimine dönüşsün.
            </p>
          </FadeUp>

          <FadeUp immediate delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <PillLink href={ROUTES.gallery} variant="translucent" withArrow={false}>
                Stüdyoları Keşfet
              </PillLink>
              <PillLink href={ROUTES.register}>Ücretsiz Başla</PillLink>
            </div>
          </FadeUp>

          <FadeUp
            immediate
            delay={0.3}
            className="relative z-10 mt-28 h-[190px] w-full sm:h-[230px]"
          >
            <CardWheel groups={WHEEL_GROUPS} />
          </FadeUp>

          <FadeUp immediate delay={0.7}>
            <div className="mt-14 flex flex-col items-center gap-2 sm:mt-6">
              <p className="text-sm text-white/90">
                Kart bilgisi gerekmez · İlk 3 görsel hediye
              </p>
              <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                {HERO_PROOF.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-1.5 text-xs text-white/70"
                  >
                    <Check className="size-3.5 text-secondary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── KATEGORİ ŞERİDİ ─────────────────────────────────────────────── */}
      <section className="overflow-hidden pt-8 pb-20 sm:pb-28">
        <div className="border-b border-black/5 pb-8">
          <Marquee durationSeconds={28} gapClassName="gap-x-16">
            {CATEGORIES.map((category) => (
              <span
                key={category}
                className="flex shrink-0 items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-foreground/40"
              >
                <Gem className="size-3.5" />
                {category}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ── HAKKIMIZDA ──────────────────────────────────────────────────── */}
      <section
        id="hakkimizda"
        className="mx-auto max-w-[1200px] px-6 pb-20 sm:pb-28"
      >
        <FadeUp className="flex flex-col items-center">
          <SectionEyebrow>Hakkımızda</SectionEyebrow>
          <h2 className="mx-auto mt-6 max-w-3xl text-center text-[32px] font-medium leading-[1.15] tracking-[-0.04em] text-foreground sm:text-[42px] lg:text-[48px]">
            Telefonunuzdaki kareyi{" "}
            <InlineIcon icon={Camera} tone="bg-primary text-primary-foreground" />{" "}
            dakikalar içinde{" "}
            <span className="text-foreground/35">
              stüdyo{" "}
              <InlineIcon icon={Gem} tone="bg-secondary text-secondary-foreground" />{" "}
              kalitesine taşıyoruz
            </span>
          </h2>
        </FadeUp>

        <div className="mt-20 grid grid-cols-1 gap-4 sm:mt-28 lg:grid-cols-[1.1fr_1fr_0.8fr]">
          <FadeUp className="relative flex min-h-[360px] flex-col justify-end overflow-hidden rounded-3xl p-3 pt-16">
            <Image
              src="/showcase/about-cover.webp"
              alt="Renza ile üretilmiş bir vitrin karesi"
              fill
              sizes="(min-width: 1024px) 34vw, 90vw"
              className="object-cover"
            />
            <span className="absolute left-6 top-6 rounded-full bg-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-sm">
              Renza üretimi
            </span>
            <span className="absolute right-6 top-6 grid size-10 place-items-center rounded-full bg-card text-foreground">
              <Camera className="size-5" />
            </span>
            <div className="relative rounded-2xl bg-card p-6">
              <p className="text-4xl font-medium tracking-[-0.03em] text-foreground">
                <AnimatedNumber end={STUDIO_TEMPLATES.length} suffix="+" />
              </p>
              <p className="mt-2 text-sm text-foreground/60">
                küratörlü stüdyo sahnesi — takı, saat, çanta ve aksesuar için
                ayrı ayrı kalibre edildi.
              </p>
            </div>
          </FadeUp>

          <FadeUp
            delay={0.12}
            className="flex flex-col justify-between rounded-3xl bg-muted p-6"
          >
            <p className="text-sm text-foreground/60">DokuKilidi sadakati</p>
            <p className="mt-2 text-5xl font-medium tracking-[-0.03em] text-foreground">
              <AnimatedNumber end={100} suffix="%" />
            </p>
            <div className="mt-8 flex -space-x-3">
              {SHOT_TYPES.map((shot) => (
                <Image
                  key={shot.label}
                  src={shot.thumb}
                  alt={shot.label}
                  width={160}
                  height={160}
                  className="size-9 rounded-full object-cover ring-2 ring-muted"
                />
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-foreground/80">
              Ürün geometrisi, rengi ve dokusu piksel piksel korunur — yalnızca
              arka plan, ışık ve yansımalar yeniden üretilir.
            </p>
          </FadeUp>

          <FadeUp delay={0.24} className="flex flex-col gap-4">
            <div className="flex-1 rounded-3xl bg-secondary p-6 text-secondary-foreground">
              <p className="text-sm text-secondary-foreground/70">Üretim yolu</p>
              <p className="mt-2 text-4xl font-medium tracking-[-0.03em]">
                {CAPABILITIES.length}
              </p>
              <p className="mt-2 text-sm text-secondary-foreground/70">
                Satış setinden kendi promptunuza kadar, aynı ekranda.
              </p>
            </div>
            <div className="flex-1 rounded-3xl bg-foreground p-6 text-background">
              <p className="text-sm text-background/60">Çözünürlük</p>
              <p className="mt-2 text-4xl font-medium tracking-[-0.03em]">
                2K / 4K
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── STÜDYODA NELER VAR ──────────────────────────────────────────── */}
      <section
        id="neler-var"
        className="mx-auto max-w-[1200px] px-6 pb-20 sm:pb-28"
      >
        <FadeUp className="flex flex-col items-center">
          <SectionEyebrow>Stüdyoda neler var</SectionEyebrow>
          <h2 className="mx-auto mt-6 max-w-2xl text-center text-[32px] font-medium leading-[1.15] tracking-[-0.04em] text-foreground sm:text-[42px] lg:text-[48px]">
            Tek bir fotoğraftan altı farklı yol
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center text-foreground/60">
            Hangi yolu seçerseniz seçin ürününüzün gerçekliği DokuKilidi ile
            korunur ve kredi yalnızca üretim başarılı olduğunda düşer.
          </p>
          <div className="mt-8 flex justify-center">
            <PillLink href={ROUTES.studio} variant="dark">
              Stüdyo&apos;yu aç
            </PillLink>
          </div>
        </FadeUp>

        <div className="mt-20 grid grid-cols-1 gap-4 rounded-[32px] bg-muted p-3 sm:mt-28 md:grid-cols-3">
          {CAPABILITIES.map((capability, i) => (
            <FadeUp
              key={capability.title}
              delay={i * 0.08}
              // justify-between YOK: kartların açıklama uzunlukları farklı
              // olduğu için serbest boşluk dağıtılırsa görseller/başlıklar
              // satır içinde birbirinden kayıyor.
              className="flex min-h-[320px] flex-col rounded-3xl bg-muted p-6"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <capability.icon className="size-4" />
                </span>
                <span className="rounded-full bg-card px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-foreground/70">
                  {capability.badge}
                </span>
              </div>

              <Image
                src={capability.image}
                alt=""
                width={720}
                height={450}
                sizes="(min-width: 768px) 30vw, 90vw"
                className="my-4 h-40 w-full rounded-2xl object-cover"
              />

              <div>
                <h3 className="text-xl font-medium tracking-[-0.02em] text-foreground">
                  {capability.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                  {capability.desc}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── PERDE ARKASI ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20 sm:pb-28">
        <FadeUp className="flex flex-col items-center">
          <SectionEyebrow>Perde arkası</SectionEyebrow>
          <h2 className="mx-auto mt-6 max-w-2xl text-center text-[32px] font-medium leading-[1.15] tracking-[-0.04em] text-foreground sm:text-[42px] lg:text-[48px]">
            Fotoğrafçı randevusu yerine tek ekran
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center text-foreground/60">
            Yükleyin, sahneyi seçin, indirin. Stüdyo kirası, ekipman ya da
            ayrı bir düzenleme aracı olmadan.
          </p>
        </FadeUp>

        <div className="mt-20 grid grid-cols-1 gap-4 sm:mt-28 md:grid-cols-2">
          {/* Kart 1 — kredi modeli */}
          <FadeUp className="flex flex-col rounded-3xl border border-black/5 bg-card p-8">
            <div className="grid flex-1 grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs text-foreground/60">Paket başına görsel</p>
                <div className="mt-4 space-y-3.5">
                  {packages.map((pkg) => (
                    <div key={pkg.id}>
                      <div className="flex items-baseline justify-between text-xs">
                        <p className="font-medium text-foreground">{pkg.name}</p>
                        <p className="text-foreground/50">{pkg.credits} kredi</p>
                      </div>
                      <AnimatedProgressBar
                        percent={Math.round((pkg.credits / maxCredits) * 100)}
                        className="mt-1.5 h-1.5"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-2xl bg-foreground p-4 text-background">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium">Kredi</p>
                    <p className="text-[10px] text-background/50">
                      Görsel başına
                    </p>
                  </div>
                  <TrendingUp className="size-4" />
                </div>
                <div>
                  <p className="text-3xl font-medium">1–2</p>
                  <p className="text-[10px] text-background/50">
                    2K = 1 kredi · 4K = 2 kredi
                  </p>
                </div>
              </div>
            </div>
            <h3 className="mt-6 text-xl font-medium tracking-[-0.02em] text-foreground">
              Kullandıkça öde
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/60">
              Abonelik yok, otomatik yenileme yok. Krediniz sona ermez ve
              başarısız bir üretimde bakiyenizden düşülmez.
            </p>
          </FadeUp>

          {/* Kart 2 — üretim başına kredi maliyeti */}
          <FadeUp delay={0.12} className="flex flex-col rounded-3xl border border-black/5 bg-card p-8">
            <div className="grid flex-1 grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs font-medium text-foreground">
                  Üretim başına kredi
                </p>
                <div className="mt-3">
                  <GrowBarChart bars={CREDIT_BARS} />
                </div>
              </div>
              <div className="flex flex-col justify-center gap-1 rounded-2xl bg-foreground p-4 text-background">
                <p className="text-lg font-medium leading-tight">
                  Konsept{" "}
                  <span className="mx-0.5 inline-flex size-4 items-center justify-center rounded-full bg-secondary align-middle text-secondary-foreground">
                    <Check className="size-3" />
                  </span>{" "}
                  <span className="text-background/40">önerisi</span>
                  <br />
                  <span className="text-background/40">ücretsiz,</span> üretim
                  <br />
                  <span className="text-background/40">yalnızca</span> başarılı
                  <br />
                  <span className="text-background/40">olursa</span> düşer
                </p>
              </div>
            </div>
            <h3 className="mt-6 text-xl font-medium tracking-[-0.02em] text-foreground">
              Her adımın maliyeti belli
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/60">
              AI konsept önerisi ücretsiz; 2K bir görsel 1, 4K bir görsel 2
              kredi. Dört kareli Satış Seti seçtiğiniz kaliteye göre 4 ya da 8
              kredi tutar — sürpriz kalem yok.
            </p>
          </FadeUp>

          {/* Kart 3 — Satış Seti */}
          <FadeUp className="flex flex-col rounded-3xl border border-black/5 bg-card p-8">
            <div className="grid flex-1 grid-cols-2 gap-3">
              <div className="flex flex-col justify-between rounded-2xl bg-foreground p-4 text-background">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium">Satış Seti</p>
                    <p className="text-[10px] text-background/50">Tek tıkla</p>
                  </div>
                  <LayoutGrid className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-medium">
                      <AnimatedNumber end={4} duration={1200} />
                    </p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                      4-8 kredi
                    </span>
                  </div>
                  <p className="text-[10px] text-background/50">
                    farklı satış karesi
                  </p>
                </div>
                <div className="mt-3 space-y-1.5">
                  <Marquee durationSeconds={26} gapClassName="gap-x-2">
                    {SHOT_TYPES.map((shot) => (
                      <span
                        key={shot.label}
                        className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[10px] text-background/70"
                      >
                        {shot.label}
                      </span>
                    ))}
                  </Marquee>
                  <Marquee durationSeconds={22} reverse gapClassName="gap-x-2">
                    {["Pazaryeri", "Sosyal medya", "Reklam", "Katalog"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[10px] text-background/70"
                        >
                          {tag}
                        </span>
                      ),
                    )}
                  </Marquee>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-2xl bg-muted p-4">
                <div>
                  <div className="flex -space-x-2">
                    {SHOT_TYPES.map((shot) => (
                      <Image
                        key={shot.label}
                        src={shot.thumb}
                        alt={shot.label}
                        width={160}
                        height={160}
                        className="size-7 rounded-full object-cover ring-2 ring-muted"
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-foreground/50">
                    Aynı üründen dört farklı kare
                  </p>
                </div>
                <p className="text-lg font-medium leading-tight text-foreground">
                  <span className="text-foreground/30">Ana görsel.</span>
                  <br />
                  <span className="text-foreground/30">Model üstünde.</span>
                  <br />
                  Detay. Vitrin.
                </p>
              </div>
            </div>
            <h3 className="mt-6 text-xl font-medium tracking-[-0.02em] text-foreground">
              Ürün sayfasının tamamı
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/60">
              Tek yüklemeden bir ilanı baştan sona dolduracak dört kare çıkar —
              her biri farklı bir kompozisyon kuralına göre kurgulanır.
            </p>
          </FadeUp>

          {/* Kart 4 — hazır stüdyolar */}
          <FadeUp delay={0.12} className="flex flex-col rounded-3xl border border-black/5 bg-card p-8">
            {/* overflow-hidden şart: yörüngedeki rozetler kart dışına
                savrulup dar ekranlarda yatay kaydırma yaratıyor. */}
            <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-muted py-8">
              <OrbitDiagram
                center={
                  <div className="grid size-14 place-items-center rounded-2xl bg-foreground text-secondary shadow-lg">
                    <Camera className="size-6" />
                  </div>
                }
                pills={[
                  {
                    thumb: "/showcase/thumb-ana.webp",
                    label: "Ana Görsel",
                    badge: "1 kredi",
                    startAngle: -30,
                    duration: 22,
                    radius: 128,
                  },
                  {
                    thumb: "/showcase/thumb-model.webp",
                    label: "Model Üstünde",
                    badge: "1 kredi",
                    startAngle: 150,
                    duration: 26,
                    radius: 104,
                  },
                  {
                    thumb: "/showcase/thumb-vitrin.webp",
                    label: "Vitrin Sahnesi",
                    badge: "1 kredi",
                    startAngle: 260,
                    duration: 30,
                    radius: 80,
                  },
                ]}
              />
            </div>
            <h3 className="mt-6 text-xl font-medium tracking-[-0.02em] text-foreground">
              Her kare için ayrı sahne
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/60">
              Kare türü değiştiğinde ışık, kadraj ve zemin de değişir; aynı
              sahne her ürüne tekrar edilmez.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── DOKUKİLİDİ ──────────────────────────────────────────────────── */}
      <section
        id="dokukilidi"
        className="mx-auto max-w-[1200px] px-6 pb-20 sm:pb-28"
      >
        <div className="rounded-[32px] bg-muted p-4 sm:p-8">
          <FadeUp className="grid items-center gap-10 lg:grid-cols-2 lg:p-6">
            <div>
              <SectionEyebrow align="left">DokuKilidi</SectionEyebrow>
              <h2 className="mt-6 text-[32px] font-medium leading-[1.15] tracking-[-0.04em] text-foreground sm:text-[42px]">
                Ürününüz aynı kalır, sahne değişir
              </h2>
              <p className="mt-5 text-foreground/60">
                Soldaki ham telefon çekimi ile sağdaki vitrin karesi aynı
                çantaya ait. Ayracı sürükleyerek karşılaştırın.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-foreground/80">
                {[
                  "Ürün geometrisi ve orantıları bozulmadan kalır",
                  "Malzeme, renk ve doku aynen korunur",
                  "Yalnızca arka plan, ışık ve yansımalar yeniden üretilir",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <BeforeAfterSlider
              beforeSrc="/showcase/dokukilidi-before-3.webp"
              afterSrc="/showcase/dokukilidi-after-2.webp"
              beforeAlt="Ham telefon çekimi"
              afterAlt="DokuKilidi ile üretilmiş vitrin karesi"
              className="aspect-square"
            />
          </FadeUp>
        </div>
      </section>

      {/* ── ÜRETİM ÖRNEKLERİ ────────────────────────────────────────────── */}
      <section id="ornekler" className="mx-auto max-w-[1200px] px-6 pb-20 sm:pb-28">
        <FadeUp className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionEyebrow align="left">Üretim örnekleri</SectionEyebrow>
            <h2 className="mt-6 text-[32px] font-medium leading-[1.15] tracking-[-0.04em] text-foreground sm:text-[42px]">
              Renza&apos;dan çıkan gerçek kareler
            </h2>
            <p className="mt-5 max-w-md text-foreground/60">
              Hepsi Stüdyo&apos;da, kullanıcıların yüklediği tek bir ürün
              fotoğrafından üretildi.
            </p>
          </div>
          <PillLink href={ROUTES.gallery} variant="dark">
            Hazır stüdyolar
          </PillLink>
        </FadeUp>

        <div className="mt-20 grid grid-cols-1 gap-4 sm:mt-28 sm:grid-cols-2 lg:grid-cols-4">
          {SHOWCASE.map((item, i) => (
            <FadeUp
              key={item.src}
              delay={i * 0.08}
              className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl"
            >
              <Image
                src={item.src}
                alt={item.caption}
                fill
                sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="relative z-10 m-6 w-fit rounded-full bg-black/45 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                {item.shot}
              </span>
              <div className="relative z-10 mt-auto p-6 pt-16 text-white">
                <p className="text-sm leading-relaxed">{item.caption}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── FİYATLANDIRMA ───────────────────────────────────────────────── */}
      <section
        id="fiyatlandirma"
        className="mx-auto max-w-[1200px] px-6 pb-20 sm:pb-28"
      >
        <FadeUp className="flex flex-col items-center">
          <SectionEyebrow>Fiyatlandırma</SectionEyebrow>
          <h2 className="mx-auto mt-6 max-w-2xl text-center text-[32px] font-medium leading-[1.15] tracking-[-0.04em] text-foreground sm:text-[42px] lg:text-[48px]">
            Basit, kredili fiyatlandırma
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-center text-foreground/60">
            2K görsel 1 kredi, 4K görsel 2 kredi. Kullandıkça öde, abonelik
            yok.
          </p>
        </FadeUp>

        <div className="mt-20 grid grid-cols-1 gap-4 rounded-[32px] bg-muted p-3 sm:mt-28 md:grid-cols-3">
          {packages.map((pkg, i) => {
            const perImage = Math.round(pkg.price_cents / pkg.credits);
            const features = [
              pkg.description ?? `${pkg.credits} profesyonel görsel hakkı`,
              `Görsel başı ≈ ${formatPrice(perImage, pkg.currency)}`,
              "2K = 1 kredi · 4K = 2 kredi",
              "Ticari kullanım hakkı, süresiz krediler",
            ];
            return (
              <FadeUp
                key={pkg.id}
                delay={i * 0.1}
                className={cn(
                  "flex flex-col rounded-3xl p-7",
                  pkg.is_popular ? "bg-secondary" : "bg-muted",
                )}
              >
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-foreground">
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full",
                      pkg.is_popular
                        ? "bg-foreground text-secondary"
                        : "bg-card text-foreground",
                    )}
                  >
                    <Gem className="size-3.5" />
                  </span>
                  {pkg.name}
                </div>

                <p className="mt-4 text-sm text-foreground/60">
                  {pkg.credits} görsel hakkı
                </p>
                <p className="mt-6 flex items-baseline gap-1 text-4xl font-medium tracking-[-0.03em] text-foreground">
                  {formatPrice(pkg.price_cents, pkg.currency)}
                  <span className="text-base font-normal text-foreground/50">
                    / paket
                  </span>
                </p>

                <ul className="mt-8 flex-1 space-y-4">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-foreground/80"
                    >
                      <BadgeCheck className="mt-0.5 size-5 shrink-0 text-foreground" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <PillLink
                  href={ROUTES.register}
                  variant="dark"
                  withArrow={false}
                  className="mt-8 justify-center"
                >
                  Başla
                </PillLink>
              </FadeUp>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TRUST_POINTS.map((point, i) => (
            <FadeUp
              key={point.title}
              delay={i * 0.08}
              className="rounded-3xl border border-black/5 bg-card p-6"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                <point.icon className="size-4" />
              </span>
              <h3 className="mt-4 text-base font-medium text-foreground">
                {point.title}
              </h3>
              <p className="mt-1.5 text-sm text-foreground/60">{point.desc}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── NEREDE KULLANILIR ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 pb-20 sm:pb-28">
        <FadeUp className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionEyebrow align="left">Nerede kullanılır</SectionEyebrow>
            <h2 className="mt-6 text-[32px] font-medium leading-[1.15] tracking-[-0.04em] text-foreground sm:text-[42px]">
              Ürettiğiniz görsel her yerde sizin
            </h2>
            <p className="mt-5 max-w-md text-foreground/60">
              Ticari kullanım hakkı size ait; ilan, sosyal medya ve reklamda
              sınırsız kullanabilirsiniz.
            </p>
          </div>
          <PillLink href={ROUTES.register}>Ücretsiz Başla</PillLink>
        </FadeUp>

        <div className="mt-20 grid grid-cols-1 gap-4 sm:mt-28 sm:grid-cols-3">
          {USE_CASES.map((useCase, i) => (
            <FadeUp
              key={useCase.title}
              delay={i * 0.1}
              className="group relative h-[280px] overflow-hidden rounded-3xl"
            >
              <Image
                src={useCase.image}
                alt=""
                fill
                sizes="(min-width: 640px) 32vw, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="text-xl font-medium leading-tight tracking-[-0.02em]">
                  {useCase.title}
                </h3>
                <p className="mt-2 text-sm text-white/80">{useCase.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── SSS ─────────────────────────────────────────────────────────── */}
      <section id="sss" className="mx-auto max-w-[1200px] px-6 pb-20 sm:pb-28">
        <FadeUp className="flex flex-col items-center">
          <SectionEyebrow>SSS</SectionEyebrow>
          <h2 className="mx-auto mt-6 max-w-2xl text-center text-[32px] font-medium leading-[1.15] tracking-[-0.04em] text-foreground sm:text-[42px] lg:text-[48px]">
            Sıkça sorulan sorular
          </h2>
        </FadeUp>

        <FadeUp className="mx-auto mt-20 max-w-3xl divide-y divide-black/5 overflow-hidden rounded-[32px] bg-muted sm:mt-28">
          {FAQ.map((item) => (
            <details key={item.q} className="group p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground">
                {item.q}
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-card transition-transform group-open:rotate-90">
                  <ArrowRight className="size-3.5" />
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/60">
                {item.a}
              </p>
            </details>
          ))}
        </FadeUp>
      </section>

      {/* ── KAPANIŞ CTA ─────────────────────────────────────────────────── */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[32px] px-8 py-16 sm:px-14 sm:py-20">
          <Image
            src="/showcase/cta-cover.webp"
            alt=""
            fill
            sizes="(min-width: 1200px) 1200px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          <FadeUp className="relative z-10 max-w-lg">
            <div className="flex items-center gap-3">
              <p className="text-sm text-white">
                Takı · Saat · Çanta için kalibre edildi
              </p>
              <div className="flex -space-x-2">
                {SHOT_TYPES.slice(0, 3).map((shot) => (
                  <Image
                    key={shot.label}
                    src={shot.thumb}
                    alt=""
                    width={160}
                    height={160}
                    className="size-8 rounded-full object-cover ring-2 ring-white/80"
                  />
                ))}
              </div>
            </div>

            <h2 className="mt-6 text-[32px] font-medium leading-[1.15] tracking-[-0.03em] text-white sm:text-[42px]">
              Ürününüzü bugün stüdyo kalitesinde görün
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/90">
              E-postanızı bırakın, hesabınız hazır olsun — ilk üç görsel
              bizden. Kart bilgisi istemiyoruz.
            </p>

            <form
              action={ROUTES.register}
              method="GET"
              className="mt-8 flex max-w-md items-center gap-2 rounded-full bg-white/15 p-1.5 pl-5 backdrop-blur-sm"
            >
              <label htmlFor="cta-email" className="sr-only">
                E-posta adresiniz
              </label>
              <input
                id="cta-email"
                name="email"
                type="email"
                placeholder="siz@markaniz.com"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center gap-2 rounded-full bg-secondary px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-secondary-foreground transition-transform hover:scale-[1.03]"
              >
                Başla
                <ArrowRight className="size-3.5" />
              </button>
            </form>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}

/** Başlık içinde geçen renkli, dairesel ikon vurgusu. */
function InlineIcon({
  icon: Icon,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <span
      className={cn(
        "mx-1 inline-flex size-9 -translate-y-1 items-center justify-center rounded-full align-middle sm:size-11",
        tone,
      )}
    >
      <Icon className="size-4 sm:size-5" />
    </span>
  );
}
