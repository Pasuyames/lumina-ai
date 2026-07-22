import Link from "next/link";
import {
  LayoutDashboard,
  Images,
  Sparkles,
  LogOut,
  User as UserIcon,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { NavLink } from "@/components/site/nav-link";
import { MobileNav } from "@/components/site/mobile-nav";
import { CreditBadge } from "@/components/billing/credit-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/constants";
import { getCurrentUser, getCredits, getProfile } from "@/lib/queries";
import { signOutAction } from "@/app/(auth)/actions";

export async function Navbar() {
  const user = await getCurrentUser();
  const credits = user ? await getCredits(user.id) : null;
  const profile = user ? await getProfile(user.id) : null;
  const initial =
    (user?.user_metadata?.full_name?.[0] as string | undefined) ??
    user?.email?.[0]?.toUpperCase() ??
    "U";

  return (
    <header className="sticky top-3 z-40 mx-auto w-full max-w-6xl px-4 sm:top-4 sm:px-6">
      <div className="relative flex h-14 items-center justify-between gap-4 rounded-full border border-border bg-card/95 px-3 shadow-sm backdrop-blur-md sm:px-5">
        <Logo />

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          <NavLink href={ROUTES.studio} icon={<Sparkles className="size-4" />}>
            Stüdyo
          </NavLink>
          <NavLink href={ROUTES.gallery} icon={<Images className="size-4" />}>
            Hazır Stüdyolar
          </NavLink>
          {user && (
            <NavLink
              href={ROUTES.generations}
              icon={<LayoutDashboard className="size-4" />}
            >
              Üretimlerim
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <CreditBadge balance={credits?.balance ?? 0} />
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Hesap menüsü"
                  className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="size-9 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    {user.email}
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
                  {profile?.is_admin && (
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
              <ButtonLink href={ROUTES.login} variant="ghost" size="sm">
                Giriş
              </ButtonLink>
              <ButtonLink href={ROUTES.register} size="sm">
                Ücretsiz Başla
              </ButtonLink>
            </>
          )}
          <div className="md:hidden">
            <MobileNav user={user} credits={credits} />
          </div>
        </div>
      </div>
    </header>
  );
}
