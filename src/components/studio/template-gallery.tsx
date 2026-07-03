"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Gem, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { STUDIO_TEMPLATES, filterTemplates } from "@/data/templates";
import { PRODUCT_CATEGORIES, ROUTES } from "@/lib/constants";
import type { StudioTemplate } from "@/data/templates";
import type { ProductCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL = Object.fromEntries(
  PRODUCT_CATEGORIES.map((c) => [c.value, c.label]),
);

export function TemplateGallery({
  onSelect,
}: {
  onSelect?: (template: StudioTemplate) => void;
}) {
  const [category, setCategory] = useState<ProductCategory | undefined>();
  const [query, setQuery] = useState("");

  const seasonal = STUDIO_TEMPLATES.filter((t) => t.tier === "seasonal");
  const filtered = filterTemplates({ category, query });
  const regular = filtered.filter((t) => t.tier !== "seasonal");
  const hasSeasonal = seasonal.length > 0;
  const empty = filtered.length === 0;

  function handleCategoryClick(value: ProductCategory) {
    setCategory((prev) => (prev === value ? undefined : value));
  }

  return (
    <div className="space-y-6">
      {/* Filtre çipleri */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Kategori filtresi">
        <button
          type="button"
          aria-pressed={!category}
          onClick={() => setCategory(undefined)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition",
            !category
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          Tümü
        </button>
        {PRODUCT_CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            aria-pressed={category === c.value}
            onClick={() => handleCategoryClick(c.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition",
              category === c.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Arama */}
      <div className="relative">
        <Label htmlFor="template-search" className="sr-only">
          Stüdyo ara
        </Label>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="template-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Stüdyo ara…"
          className="pl-9 h-10"
        />
      </div>

      {/* Kampanya Dönemi Stüdyoları */}
      {hasSeasonal && (
        <div>
          <h2 className="font-heading mb-4 text-xl font-semibold">
            Kampanya Dönemi Stüdyoları
          </h2>
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {seasonal.map((t) => (
              <TemplateCard key={t.id} template={t} onSelect={onSelect} />
            ))}
          </div>
          <hr className="border-border" />
        </div>
      )}

      {/* Ana liste */}
      {empty ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
          <Gem className="size-10 text-muted-foreground/40" />
          <p className="mt-3 font-heading text-lg font-medium">
            Bu filtreyle eşleşen stüdyo yok
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Filtreyi değiştirip tekrar deneyin.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {regular.map((t) => (
            <TemplateCard key={t.id} template={t} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: StudioTemplate;
  onSelect?: (template: StudioTemplate) => void;
}) {
  const cardContent = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-accent/70 to-muted">
        {template.referenceImage ? (
          <Image
            src={template.referenceImage}
            alt={template.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-primary/30 transition group-hover:scale-110">
            <Gem className="size-10" />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg font-medium">{template.title}</h3>
          {!onSelect && (
            <ArrowRight className="size-4 shrink-0 translate-x-0 text-muted-foreground opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
          )}
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {template.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {template.bestFor.map((c) => (
            <Badge key={c} variant="secondary" className="text-[11px]">
              {CATEGORY_LABEL[c] ?? c}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(template)}
        className="group overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:border-primary/40 hover:shadow-lg"
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link
      href={`${ROUTES.studio}?template=${template.id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-lg"
    >
      {cardContent}
    </Link>
  );
}