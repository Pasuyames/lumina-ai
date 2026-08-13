import { SiteHeaderBar } from "@/components/site/site-header-bar";
import { getCurrentUser, getCredits, getProfile } from "@/lib/queries";

/**
 * Başlığın sunucu tarafı sarmalayıcısı: oturum/kredi/rol bilgisini okuyup
 * istemci bileşenine yalın değer olarak geçirir (kaydırma davranışı ve
 * menü için bar'ın kendisi client olmak zorunda).
 */
export async function SiteHeader() {
  const user = await getCurrentUser();
  const credits = user ? await getCredits(user.id) : null;
  const profile = user ? await getProfile(user.id) : null;

  const initial =
    (user?.user_metadata?.full_name?.[0] as string | undefined) ??
    user?.email?.[0]?.toUpperCase() ??
    "U";

  return (
    <SiteHeaderBar
      loggedIn={Boolean(user)}
      balance={credits?.balance ?? null}
      email={user?.email ?? null}
      initial={initial}
      isAdmin={Boolean(profile?.is_admin)}
    />
  );
}
