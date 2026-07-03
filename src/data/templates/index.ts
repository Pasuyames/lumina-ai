import {
  FLAGSHIP_TEMPLATES,
} from "./flagship";
import {
  EXTENDED_TEMPLATES,
} from "./extended";
import {
  SEASONAL_TEMPLATES,
} from "./seasonal";
import type { StudioTemplate, TemplateTier, TemplateSeason } from "./types";
import type { ProductCategory } from "@/lib/constants";

export const STUDIO_TEMPLATES: StudioTemplate[] = [
  ...FLAGSHIP_TEMPLATES,
  ...EXTENDED_TEMPLATES,
  ...SEASONAL_TEMPLATES,
].sort((a, b) => a.sortOrder - b.sortOrder);

export function getTemplateById(id: string): StudioTemplate | undefined {
  return STUDIO_TEMPLATES.find((t) => t.id === id);
}

export interface TemplateFilters {
  category?: ProductCategory;
  tag?: string;
  tier?: TemplateTier;
  season?: TemplateSeason;
  query?: string;
}

export function filterTemplates(filters: TemplateFilters): StudioTemplate[] {
  const { category, tag, tier, season, query } = filters;

  return STUDIO_TEMPLATES.filter((template) => {
    if (category && !template.bestFor.includes(category)) {
      return false;
    }
    if (tag && !template.tags.includes(tag)) {
      return false;
    }
    if (tier && template.tier !== tier) {
      return false;
    }
    if (season && template.season !== season) {
      return false;
    }
    if (query) {
      const lowerQuery = query.toLocaleLowerCase("tr");
      const searchableText = [
        template.title,
        template.description,
        ...template.tags,
      ].join(" ").toLocaleLowerCase("tr");
      if (!searchableText.includes(lowerQuery)) {
        return false;
      }
    }
    return true;
  });
}

export type { StudioTemplate, TemplateTier, TemplateSeason } from "./types";