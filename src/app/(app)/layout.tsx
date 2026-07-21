import { redirect } from "next/navigation";
import { AppShell } from "@/components/site/app-shell";
import { getCurrentUser } from "@/lib/queries";
import { ROUTES } from "@/lib/constants";

/** Oturum zorunlu alan. Middleware'e ek ikinci savunma hattı. */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);

  return <AppShell>{children}</AppShell>;
}
