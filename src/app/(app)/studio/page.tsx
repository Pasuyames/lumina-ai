import type { Metadata } from "next";
import { getCurrentUser, getCredits } from "@/lib/queries";
import { getTemplateById } from "@/lib/templates";
import { CreditBadge } from "@/components/billing/credit-badge";
import { StudioClient } from "@/components/studio/studio-client";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Stüdyo" };

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template: templateId } = await searchParams;
  const user = (await getCurrentUser())!;
  const credits = await getCredits(user.id);
  const balance = credits?.balance ?? 0;
  const template = templateId ? (getTemplateById(templateId) ?? null) : null;

  return (
    <PageHeader
      title="Stüdyo"
      description="Ürün fotoğrafınızı yükleyin, yapay zekâ gerisini halletsin."
      width="narrow"
      align="center"
      actions={<CreditBadge balance={balance} />}
    >
      <div className="mt-8">
        <StudioClient initialBalance={balance} initialTemplate={template} />
      </div>
    </PageHeader>
  );
}
