import Link from "next/link";
import Image from "next/image";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { PillLink } from "@/components/marketing/pill-link";

const LINK_COLUMNS: { title: string; links: { label: string; href: string }[] }[] =
  [
    {
      title: "Ürün",
      links: [
        { label: "Stüdyo", href: ROUTES.studio },
        { label: "Hazır Stüdyolar", href: ROUTES.gallery },
        { label: "Fiyatlandırma", href: "/#fiyatlandirma" },
        { label: "Üretim örnekleri", href: "/#ornekler" },
      ],
    },
    {
      title: "Hesap",
      links: [
        { label: "Ücretsiz başla", href: ROUTES.register },
        { label: "Giriş yap", href: ROUTES.login },
        { label: "Kredi & paketler", href: ROUTES.billing },
        { label: "Üretimlerim", href: ROUTES.generations },
      ],
    },
    {
      title: "Yasal",
      links: [
        { label: "Kullanım Şartları", href: ROUTES.terms },
        { label: "Gizlilik & KVKK", href: ROUTES.privacy },
        { label: "İptal & İade", href: ROUTES.refund },
        { label: "SSS", href: "/#sss" },
      ],
    },
  ];

/** Koyu, yuvarlatılmış kart biçiminde site altbilgisi. */
export function SiteFooter() {
  return (
    <footer className="mt-auto px-4 pb-4 sm:px-6">
      <div className="mx-auto max-w-[1200px] rounded-[32px] bg-foreground px-8 py-14 text-background sm:px-14">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href={ROUTES.home} className="inline-flex items-center">
              <Image
                src="/renza-logo.png"
                alt={APP_NAME}
                width={318}
                height={109}
                className="h-7 w-auto"
              />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-background/60">
              Tek bir telefon fotoğrafından profesyonel ürün çekimi. Ürününüzün
              geometrisi, rengi ve dokusu korunur; yalnızca sahne değişir.
            </p>

            <div className="mt-8">
              <PillLink href={ROUTES.register} variant="primary">
                Ücretsiz Başla
              </PillLink>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {LINK_COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-background/40">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-4">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-background/70 transition-colors hover:text-background"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-background/50">
          <p>
            Ürettiğiniz görsellerin ticari kullanım hakkı size aittir. Krediler
            sona ermez, otomatik yenileme yoktur.
          </p>
          <p>
            © {new Date().getFullYear()} {APP_NAME}. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
