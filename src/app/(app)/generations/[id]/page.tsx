import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser, getGenerationById } from "@/lib/queries";
import { qualityLabelFor } from "@/lib/credits";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";

export default async function GenerationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = (await getCurrentUser())!;
  const g = await getGenerationById(user.id, id);

  if (!g) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <ButtonLink
        href={ROUTES.generations}
        variant="ghost"
        size="sm"
        className="mb-6 gap-1.5"
      >
        <ArrowLeft className="size-4" /> Üretimlerim
      </ButtonLink>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-muted">
          {g.result_image_url ? (
            <Image
              src={g.result_image_url}
              alt={g.concept_title ?? "Üretim"}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="grid size-full place-items-center text-muted-foreground">
              Görsel henüz hazır değil ({g.status})
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <Badge variant="secondary">{g.category ?? "ürün"}</Badge>
            <h1 className="font-heading mt-2 text-2xl font-semibold">
              {g.concept_title ?? "İsimsiz konsept"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(g.created_at)} · {g.credits_spent} kredi
            </p>
          </div>

          {g.prompt && (
            <Card>
              <CardContent className="pt-5">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Kullanılan prompt
                </p>
                <p className="text-sm leading-relaxed">{g.prompt}</p>
              </CardContent>
            </Card>
          )}

          {g.result_image_url && (
            <a
              href={g.result_image_url}
              download
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ className: "gap-2" })}
            >
              <Download className="size-4" /> {qualityLabelFor(g.credits_spent)} görseli indir
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
