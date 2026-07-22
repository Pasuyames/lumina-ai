import type { Metadata } from "next";
import { getCurrentUser, getCredits, getGenerations } from "@/lib/queries";
import { getTemplateById } from "@/lib/templates";
import { CreditBadge } from "@/components/billing/credit-badge";
import { StudioClient } from "@/components/studio/studio-client";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Stüdyo" };

const RECENT_LIMIT = 6;

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template: templateId } = await searchParams;
  const user = (await getCurrentUser())!;
  const [credits, generations] = await Promise.all([
    getCredits(user.id),
    getGenerations(user.id, RECENT_LIMIT * 2),
  ]);
  const balance = credits?.balance ?? 0;
  const template = templateId ? (getTemplateById(templateId) ?? null) : null;

  // Yalnızca gerçekten görüntülenebilecek (tamamlanmış + görseli olan)
  // kayıtlar — başarısız/işlemdeki üretimler bu şeritte gösterilmez.
  const recentGenerations = generations
    .filter((g) => g.status === "completed" && g.result_image_url)
    .slice(0, RECENT_LIMIT)
    .map((g) => ({
      id: g.id,
      title: g.concept_title,
      imageUrl: g.result_image_url!,
    }));

  return (
    <PageHeader
      title="Stüdyo"
      description="Ürün fotoğrafınızı yükleyin, yapay zekâ gerisini halletsin."
      width="narrow"
      align="center"
      actions={<CreditBadge balance={balance} />}
    >
      <div className="mt-8">
        <StudioClient
          initialBalance={balance}
          initialTemplate={template}
          recentGenerations={recentGenerations}
        />
      </div>
    </PageHeader>
  );
}
