"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Sparkles,
  Images,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Settings,
  Coins,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/app/(auth)/actions";

/**
 * Mobilde başlık linklerini gösteren hamburger menü (md ve üstünde gizli).
 * `solid=false` iken hero fotoğrafının üstünde durduğu için tetikleyici
 * beyaza döner.
 */
export function MobileNav({
  loggedIn,
  email,
  balance,
  solid = true,
}: {
  loggedIn: boolean;
  email: string | null;
  balance: number | null;
  solid?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = React.useState(pathname);

  // Bir linke tıklanıp route değişince paneli kapat (render sırasında state
  // uyarlama deseni — bkz. react.dev/learn/you-might-not-need-an-effect).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Menüyü aç"
            className={cn(
              "md:hidden",
              !solid && "text-white hover:bg-white/15 hover:text-white",
            )}
          />
        }
      >
        <Menu className="size-5" />
      </DialogTrigger>
      <DialogContent className="top-0 left-0 grid h-dvh w-full max-w-none translate-x-0 translate-y-0 grid-rows-[auto_1fr_auto] gap-0 rounded-none p-0 sm:max-w-none">
        <DialogTitle className="border-b border-border px-4 py-4 text-left font-heading text-lg font-semibold">
          Menü
        </DialogTitle>

        <nav className="flex flex-col gap-1 overflow-y-auto px-3 py-4">
          <MobileNavLink href={ROUTES.studio} icon={<Sparkles className="size-4" />}>
            Stüdyo
          </MobileNavLink>
          <MobileNavLink href={ROUTES.gallery} icon={<Images className="size-4" />}>
            Hazır Stüdyolar
          </MobileNavLink>
          {loggedIn ? (
            <>
              <MobileNavLink
                href={ROUTES.generations}
                icon={<LayoutDashboard className="size-4" />}
              >
                Üretimlerim
              </MobileNavLink>
              <MobileNavLink
                href={ROUTES.dashboard}
                icon={<LayoutDashboard className="size-4" />}
              >
                Panel
              </MobileNavLink>
              <MobileNavLink
                href={ROUTES.billing}
                icon={<UserIcon className="size-4" />}
              >
                Kredi & Paketler
              </MobileNavLink>
              <MobileNavLink
                href={ROUTES.settings}
                icon={<Settings className="size-4" />}
              >
                Ayarlar
              </MobileNavLink>
            </>
          ) : (
            <>
              <MobileNavLink href="/#fiyatlandirma" icon={<Coins className="size-4" />}>
                Fiyatlandırma
              </MobileNavLink>
              <MobileNavLink href="/#sss" icon={<UserIcon className="size-4" />}>
                SSS
              </MobileNavLink>
            </>
          )}
        </nav>

        <div className="border-t border-border p-4">
          {loggedIn ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm text-muted-foreground">{email}</p>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium">
                  <Coins className="size-3.5" />
                  {balance ?? 0} kredi
                </span>
              </div>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                >
                  <LogOut className="size-4" /> Çıkış yap
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <ButtonLink href={ROUTES.login} variant="outline">
                Giriş
              </ButtonLink>
              <ButtonLink href={ROUTES.register}>Ücretsiz Başla</ButtonLink>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobileNavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-full px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground",
        isActive && "bg-accent/60 text-foreground",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
