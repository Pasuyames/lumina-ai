"use client";

import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Concept } from "@/lib/gemini/analyze";

export function ConceptCard({
  concept,
  selected,
  onSelect,
  disabled,
}: {
  concept: Concept;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "group relative flex h-full flex-col rounded-xl border p-5 text-left transition",
        selected
          ? "border-primary bg-accent/40 ring-1 ring-primary/30"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent/20",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="size-4" />
        </span>
        {selected && (
          <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-3.5" />
          </span>
        )}
      </div>
      <h3 className="font-heading mt-3 text-base font-medium">
        {concept.title}
      </h3>
      <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
        {concept.description}
      </p>
    </button>
  );
}
