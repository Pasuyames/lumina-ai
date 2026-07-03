"use client";

import { Sparkles, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StudioTemplate } from "@/lib/templates";

/* ─── Hazır Stüdyo paneli ─── */
export function TemplatePanel({
  template,
  hasFile,
  busy,
  generating,
  onGenerate,
  onSwitchToAi,
}: {
  template: StudioTemplate;
  hasFile: boolean;
  busy: boolean;
  generating: boolean;
  onGenerate: () => void;
  onSwitchToAi: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center space-y-4 rounded-2xl border border-border bg-card/50 p-6">
      <Badge variant="secondary" className="w-fit gap-1.5">
        <Sparkles className="size-3.5 text-primary" /> Hazır Stüdyo
      </Badge>
      <div>
        <h3 className="font-heading text-xl font-medium">{template.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {template.description}
        </p>
      </div>
      <Button
        onClick={onGenerate}
        disabled={!hasFile || busy}
        size="lg"
        className="w-full gap-2"
      >
        {generating ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImageIcon className="size-4" />
        )}
        {generating ? "Üretiliyor… (~10-20 sn)" : "Bu stüdyoyla üret · 1 kredi"}
      </Button>
      <button
        type="button"
        onClick={onSwitchToAi}
        disabled={!hasFile || busy}
        className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-60"
      >
        veya yapay zekâ bana konsept önersin
      </button>
      {!hasFile && (
        <p className="text-center text-xs text-muted-foreground">
          Önce soldan bir görsel yükleyin.
        </p>
      )}
    </div>
  );
}
