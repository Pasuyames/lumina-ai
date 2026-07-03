import { Logo } from "@/components/site/logo";
import { APP_TAGLINE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <Logo />
          <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Lumina. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
