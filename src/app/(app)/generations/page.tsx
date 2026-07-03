import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  failStaleGenerations,
  getCurrentUser,
  getGenerations,
} from "@/lib/queries";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Üretimlerim" };

const STATUS_LABEL: Record<string, string> = {
  pending: "Sırada",
  processing: "Üretiliyor",
  completed: "Tamamlandı",
  failed: "Başarısız",
};

export default async function GenerationsPage() {
  const user = (await getCurrentUser())!;
  await failStaleGenerations(user.id);
  const generations = await getGenerations(user.id, 60);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Üretimlerim</h1>
          <p className="mt-1 text-muted-foreground">
            Ürettiğiniz tüm görseller ve geçmişi.
          </p>
        </div>
        <ButtonLink href={ROUTES.studio} className="gap-2">
          <Sparkles className="size-4" /> Yeni
        </ButtonLink>
      </div>

      {generations.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            Henüz üretim yok.{" "}
            <Link href={ROUTES.studio} className="text-primary hover:underline">
              İlkini oluştur
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {generations.map((g) => (
            <Link
              key={g.id}
              href={`${ROUTES.generations}/${g.id}`}
              className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/40"
            >
              <div className="relative aspect-[4/5] bg-muted">
                {g.result_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.result_image_url}
                    alt={g.concept_title ?? "Üretim"}
                    className="size-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-xs text-muted-foreground">
                    görsel yok
                  </div>
                )}
                <Badge
                  variant={g.status === "completed" ? "default" : "secondary"}
                  className="absolute left-2 top-2 text-[10px]"
                >
                  {STATUS_LABEL[g.status] ?? g.status}
                </Badge>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">
                  {g.concept_title ?? "İsimsiz konsept"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(g.created_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
