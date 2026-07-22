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
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Badge
            variant="outline"
            className="mb-6 gap-1.5 border-border bg-card px-3 py-1 shadow-sm"
          >
            <Gem className="size-3.5 text-primary" />
            Takı · Saat · Çanta için tasarlandı
          </Badge>
          <h1 className="font-heading mx-auto max-w-2xl text-balance text-5xl font-extrabold leading-[1.05] text-foreground sm:text-6xl md:text-7xl">
            Telefon çekiminden
            <br />
            <span className="font-accent text-primary">stüdyo kalitesine</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
            60 saniyede, tek fotoğraftan profesyonel ürün çekimi.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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

        {/* Hero görseli — projede gerçek ürün fotoğrafı bulunmadığı için
            (bkz. brief) yumuşak stüdyo-ışığı kompozisyonu + süzülen rozetler. */}
        <div className="relative mx-auto mt-16 max-w-4xl px-4 sm:px-6">
          <div
            aria-hidden
            className="coral-glow pointer-events-none absolute -inset-10 -z-10"
          />
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_30px_80px_-30px_rgba(24,24,27,0.25)] sm:aspect-[16/9]">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_38%,#fff,transparent)]"
            />
            <div className="absolute inset-0 grid place-items-center">
              <FacetedGem className="h-48 w-48 sm:h-64 sm:w-64" />
            </div>

            <FloatingBadge
              icon={<Sparkles className="size-3.5" />}
              label="AI destekli"
              className="left-[6%] top-[16%] -rotate-3"
            />
            <FloatingBadge
              icon={<Zap className="size-3.5" />}
              label="60 saniye"
              className="right-[8%] top-[22%] rotate-2"
            />
            <FloatingBadge
              icon={<ShieldCheck className="size-3.5" />}
              label="DokuKilidi"
              className="bottom-[14%] left-[12%] rotate-2"
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

      {/* ── CTA ── */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-accent/50 to-card p-10 text-center sm:p-16">
          <h2 className="font-heading mx-auto max-w-xl text-2xl font-semibold sm:text-4xl">
            İlk 3 görseliniz bizden
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Saniyeler içinde markanızın hak ettiği görselleri üretmeye başlayın.
          </p>
          <ButtonLink href={ROUTES.register} size="lg" className="mt-8 gap-2">
            Ücretsiz hesap oluştur <ArrowRight className="size-4" />
          </ButtonLink>
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
