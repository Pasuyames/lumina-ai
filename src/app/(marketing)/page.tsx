import {
  ArrowRight,
  Upload,
  Wand2,
  Sparkles,
  Gem,
  Check,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { STUDIO_TEMPLATES } from "@/lib/templates";

const STEPS = [
  {
    icon: Upload,
    title: "Ham fotoğrafı yükle",
    desc: "Telefonla çekilmiş sade bir ürün fotoğrafı yeterli.",
  },
  {
    icon: Wand2,
    title: "Konsepti seç",
    desc: "Yapay zekâ ürünü analiz eder, 3 lüks stüdyo konsepti önerir.",
  },
  {
    icon: Sparkles,
    title: "2K görseli indir",
    desc: "Ürünün şekli korunur; arka plan, ışık ve yansıma yeniden üretilir.",
  },
];

const PLANS = [
  { name: "Başlangıç", credits: 20, price: "₺99", popular: false },
  { name: "Profesyonel", credits: 60, price: "₺249", popular: true },
  { name: "Stüdyo", credits: 200, price: "₺699", popular: false },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.93_0.05_82/0.6),transparent)]"
        />
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 rounded-full px-3 py-1"
          >
            <Gem className="size-3.5 text-primary" />
            Takı · Saat · Çanta için tasarlandı
          </Badge>
          <h1 className="font-heading mx-auto max-w-3xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Ürünleriniz <span className="text-gold-gradient">stüdyo
            kalitesinde</span> parlasın
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
            Ham ürün fotoğrafınızı yükleyin, yapay zekânın önerdiği lüks
            konseptlerden birini seçin ve saniyeler içinde profesyonel bir
            e-ticaret görseli elde edin.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href={ROUTES.register} size="lg" className="gap-2">
              3 görseli ücretsiz dene <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href={ROUTES.gallery} size="lg" variant="outline">
              Hazır stüdyoları gör
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Kayıt olan herkese <strong className="text-foreground">3 ücretsiz
            görsel hakkı</strong> — kredi kartı gerekmez.
          </p>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
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
          {STUDIO_TEMPLATES.map((t) => (
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

      {/* ── FİYATLANDIRMA ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            Basit, kredili fiyatlandırma
          </h2>
          <p className="mt-2 text-muted-foreground">
            Her başarılı görsel 1 kredi. Kullandıkça öde, abonelik yok.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <Card
              key={p.name}
              className={`relative p-6 ${
                p.popular ? "border-primary shadow-lg ring-1 ring-primary/20" : ""
              }`}
            >
              {p.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  En popüler
                </Badge>
              )}
              <h3 className="font-heading text-lg font-medium">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-heading text-4xl font-semibold">
                  {p.price}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {p.credits} görsel hakkı
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> 2K çözünürlük
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> Tüm hazır stüdyolar
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> Ticari kullanım
                </li>
              </ul>
              <ButtonLink
                href={ROUTES.register}
                className="mt-6 w-full"
                variant={p.popular ? "default" : "outline"}
              >
                Başla
              </ButtonLink>
            </Card>
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
