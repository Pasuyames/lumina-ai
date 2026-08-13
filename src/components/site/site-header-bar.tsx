"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Coins,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { PillLink } from "@/components/marketing/pill-link";
import { MobileNav } from "@/components/site/mobile-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/app/(auth)/actions";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Oturum açıkken uygulama linkleri, kapalıyken pazarlama linkleri. */
const GUEST_LINKS = [
  { label: "Stüdyo", href: ROUTES.studio },
  { label: "Hazır Stüdyolar", href: ROUTES.gallery },
  { label: "Fiyatlandırma", href: "/#fiyatlandirma" },
  { label: "SSS", href: "/#sss" },
];

const MEMBER_LINKS = [
  { label: "Stüdyo", href: ROUTES.studio },
  { label: "Hazır Stüdyolar", href: ROUTES.gallery },
  { label: "Üretimlerim", href: ROUTES.generations },
];

const SCROLL_THRESHOLD = 80;

/**
 * Site geneli tek başlık. Ana sayfada hero fotoğrafının ÜSTÜNDE saydam
 * durur (beyaz metin), kaydırılınca beyaz zemine oturur; diğer tüm
 * sayfalarda (pazarlama + uygulama) baştan beyaz zeminde açılır ve altına
 * kendi yüksekliği kadar boşluk bırakır.
 */
export function SiteHeaderBar({
  loggedIn,
  balance,
  email,
  initial,
  isAdmin,
}: {
  loggedIn: boolean;
  balance: number | null;
  email: string | null;
  initial: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const overlay = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !overlay || scrolled;
  const links = loggedIn ? MEMBER_LINKS : GUEST_LINKS;

  return (
    <>
      {/* Başlık `fixed` — hero'suz sayfalarda içeriğin altına kaçmaması
          için aynı yükseklikte bir boşluk bırakılır. */}
      {!overlay && <div aria-hidden className="h-20" />}

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,padding] duration-300",
          solid
            ? "bg-card/90 py-3 shadow-md backdrop-blur-md"
            : "bg-transparent py-7",
        )}
      >
        <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 px-6 lg:px-10">
          <Link href={ROUTES.home} className="flex items-center">
            <Image
              src="/renza-logo.png"
              alt={APP_NAME}
              width={318}
              height={109}
              priority
              className="h-6 w-auto sm:h-7"
            />
          </Link>

          <nav
            className={cn(
              "hidden items-center gap-9 font-mono text-sm uppercase tracking-[0.12em] transition-colors duration-300 md:flex",
              solid ? "text-foreground" : "text-white",
            )}
          >
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "transition-opacity hover:opacity-70",
                  pathname === link.href && "underline underline-offset-8",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {loggedIn ? (
              <>
                <Link
                  href={ROUTES.billing}
                  className={cn(
                    "hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-300 sm:inline-flex",
                    solid
                      ? "bg-muted text-foreground hover:bg-accent"
                      : "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25",
                  )}
                >
                  <Coins className="size-3.5" />
                  {balance ?? 0} kredi
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Hesap menüsü"
                    className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Avatar
                      className={cn(
                        "size-9 border transition-colors duration-300",
                        solid ? "border-border" : "border-white/40",
                      )}
                    >
                      <AvatarFallback className="bg-foreground text-secondary">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="truncate">
                      {email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href={ROUTES.dashboard} />}>
                      <LayoutDashboard className="size-4" /> Panel
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href={ROUTES.billing} />}>
                      <UserIcon className="size-4" /> Kredi & Paketler
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href={ROUTES.settings} />}>
                      <Settings className="size-4" /> Ayarlar
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem render={<Link href={ROUTES.admin} />}>
                        <ShieldCheck className="size-4" /> Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <form action={signOutAction} className="w-full">
                      <DropdownMenuItem
                        nativeButton
                        render={<button type="submit" className="w-full" />}
                      >
                        <LogOut className="size-4" /> Çıkış yap
                      </DropdownMenuItem>
                    </form>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.login}
                  className={cn(
                    "hidden font-mono text-xs uppercase tracking-[0.12em] transition-opacity hover:opacity-70 sm:inline",
                    solid ? "text-foreground" : "text-white",
                  )}
                >
                  Giriş
                </Link>
                <PillLink
                  href={ROUTES.register}
                  variant={solid ? "dark" : "primary"}
                >
                  Ücretsiz Başla
                </PillLink>
              </>
            )}

            <div className="md:hidden">
              <MobileNav
                loggedIn={loggedIn}
                email={email}
                balance={balance}
                solid={solid}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
