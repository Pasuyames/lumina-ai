import Link from "next/link";
import {
  LayoutDashboard,
  Images,
  Sparkles,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
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
import { getCurrentUser, getCredits } from "@/lib/queries";
import { signOutAction } from "@/app/(auth)/actions";

export async function Navbar() {
  const user = await getCurrentUser();
  const credits = user ? await getCredits(user.id) : null;
  const initial =
    (user?.user_metadata?.full_name?.[0] as string | undefined) ??
    user?.email?.[0]?.toUpperCase() ??
    "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
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
        </div>

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
                  <DropdownMenuSeparator />
                  <form action={signOutAction} className="w-full">
                    <DropdownMenuItem
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
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
    >
      {icon}
      {children}
    </Link>
  );
}
