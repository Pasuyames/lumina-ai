import { redirect } from "next/navigation";
import { getCurrentUser, getProfile } from "@/lib/queries";
import { ROUTES } from "@/lib/constants";

/** Admin alanı — is_admin false ise sessizce dashboard'a döner. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);

  const profile = await getProfile(user.id);
  if (!profile?.is_admin) redirect(ROUTES.dashboard);

  return <>{children}</>;
}
