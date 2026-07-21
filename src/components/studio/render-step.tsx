"use client";

import { Sparkles, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  RenderOptions,
  renderButtonLabel,
  type AspectRatioValue,
} from "@/components/studio/render-options";
import { useProgressMessages } from "@/lib/hooks/use-progress-messages";
import type { StudioTemplate } from "@/lib/templates";
import type { RenderQuality } from "@/lib/credits";

/* ─── Hazır Stüdyo paneli ─── */
export function TemplatePanel({
  template,
  hasFile,
  busy,
  generating,
  aspectRatio,
  onAspectRatioChange,
  quality,
  onQualityChange,
  onGenerate,
  onSwitchToAi,
}: {
  template: StudioTemplate;
  hasFile: boolean;
  busy: boolean;
  generating: boolean;
  aspectRatio: AspectRatioValue;
  onAspectRatioChange: (v: AspectRatioValue) => void;
  quality: RenderQuality;
  onQualityChange: (v: RenderQuality) => void;
  onGenerate: () => void;
  onSwitchToAi: () => void;
}) {
  const progressMessage = useProgressMessages(generating);
  return (
    <Card className="flex-1 justify-center gap-4 rounded-2xl border border-border bg-card/50 p-6 ring-0">
      <Badge variant="secondary" className="w-fit gap-1.5">
        <Sparkles className="size-3.5 text-primary" /> Hazır Stüdyo
      </Badge>
      <div>
        <h3 className="font-heading text-xl font-medium">{template.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {template.description}
        </p>
      </div>
      <RenderOptions
        aspectRatio={aspectRatio}
        onAspectRatioChange={onAspectRatioChange}
        quality={quality}
        onQualityChange={onQualityChange}
        disabled={busy}
      />
      <Button
        onClick={onGenerate}
        disabled={!hasFile || busy}
        size="lg"
        className="w-full gap-2"
      >
        {generating ? (
          <Spinner />
        ) : (
          <ImageIcon className="size-4" />
        )}
        {generating ? progressMessage : renderButtonLabel(quality)}
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
    </Card>
  );
}
