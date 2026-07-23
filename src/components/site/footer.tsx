import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { APP_TAGLINE, ROUTES } from "@/lib/constants";

const LEGAL_LINKS = [
  { href: ROUTES.terms, label: "Kullanım Şartları" },
  { href: ROUTES.privacy, label: "Gizlilik & KVKK" },
  { href: ROUTES.refund, label: "İptal & İade" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <Logo />
          <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
        </div>
        <div className="flex flex-col items-center gap-2 sm:items-end">
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Renza. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
