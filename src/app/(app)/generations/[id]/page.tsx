import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/queries";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";

export default async function GenerationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = (await getCurrentUser())!;
  const supabase = await createClient();
  const { data: g } = await supabase
    .from("generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

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
        <div className="overflow-hidden rounded-2xl border border-border bg-muted">
          {g.result_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={g.result_image_url}
              alt={g.concept_title ?? "Üretim"}
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <div className="grid aspect-[4/5] w-full place-items-center text-muted-foreground">
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
              <Download className="size-4" /> 2K görseli indir
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
