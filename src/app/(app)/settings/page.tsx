import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ProfileForm } from "@/components/settings/profile-form";
import { EmailForm } from "@/components/settings/email-form";
import { PasswordForm } from "@/components/settings/password-form";
import { DangerZone } from "@/components/settings/danger-zone";
import { getCurrentUser, getProfile } from "@/lib/queries";
import { ROUTES } from "@/lib/constants";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Ayarlar" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);
  const profile = await getProfile(user.id);

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    profile?.full_name ??
    "";

  return (
    <PageHeader
      title="Ayarlar"
      description="Hesap bilgilerinizi yönetin."
      width="narrow"
    >
      <div className="mt-8 space-y-6">
        <ProfileForm fullName={fullName} />
        <EmailForm email={user.email ?? ""} />
        <PasswordForm />
        <DangerZone />
      </div>
    </PageHeader>
  );
}
