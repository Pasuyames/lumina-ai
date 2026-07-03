import type { Metadata } from "next";
import { getCurrentUser, getCredits } from "@/lib/queries";
import { getTemplateById } from "@/lib/templates";
import { CreditBadge } from "@/components/billing/credit-badge";
import { StudioClient } from "@/components/studio/studio-client";

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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Stüdyo</h1>
          <p className="mt-1 text-muted-foreground">
            Ürün fotoğrafınızı yükleyin, yapay zekâ gerisini halletsin.
          </p>
        </div>
        <CreditBadge balance={balance} />
      </div>

      <StudioClient initialBalance={balance} initialTemplate={template} />
    </div>
  );
}
