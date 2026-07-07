import type { ProductCategory } from "@/lib/constants";

export type TemplateTier = "flagship" | "extended" | "seasonal";
export type TemplateSeason =
  | "yilbasi"
  | "sevgililer-gunu"
  | "anneler-gunu"
  | "ramazan-bayram"
  | "black-friday";

export interface StudioTemplate {
  id: string;
  title: string;
  description: string;
  bestFor: ProductCategory[];
  tags: string[];
  tier: TemplateTier;
  season?: TemplateSeason;
  referenceImage?: string;
  /** Referans görsel yokken kartta gösterilen CSS sahne önizlemesi. */
  preview?: { from: string; via?: string; to: string };
  prompt: string;
  sortOrder: number;
}