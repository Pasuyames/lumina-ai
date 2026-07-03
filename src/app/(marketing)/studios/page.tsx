import Link from "next/link";
import type { Metadata } from "next";
import { Gem, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STUDIO_TEMPLATES } from "@/lib/templates";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Hazır Stüdyolar",
  description:
    "Önceden tasarlanmış lüks stüdyo şablonları — birini seçin, ürününüz anında o sahneye taşınsın.",
};

const CATEGORY_LABEL = Object.fromEntries(
  PRODUCT_CATEGORIES.map((c) => [c.value, c.label]),
);

export default function StudiosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
          Hazır Stüdyolar
        </h1>
        <p className="mt-3 text-muted-foreground">
          Her şablonun arkasında, uzmanlarca hazırlanmış gizli bir sahne promptu
          vardır. Birini seçtiğinizde ürününüz doğrudan o stüdyoya taşınır — prompt
          yazmanıza gerek yok.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {STUDIO_TEMPLATES.map((t) => (
          <Link
            key={t.id}
            href={`${ROUTES.studio}?template=${t.id}`}
            className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-accent/70 to-muted">
              <div className="absolute inset-0 grid place-items-center text-primary/30 transition group-hover:scale-110">
                <Gem className="size-10" />
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-lg font-medium">{t.title}</h3>
                <ArrowRight className="size-4 shrink-0 translate-x-0 text-muted-foreground opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.bestFor.map((c) => (
                  <Badge key={c} variant="secondary" className="text-[11px]">
                    {CATEGORY_LABEL[c] ?? c}
                  </Badge>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
