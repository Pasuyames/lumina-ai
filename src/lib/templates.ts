/**
 * İLHAM GALERİSİ — "Hazır Stüdyolar"
 *
 * Geriye dönük uyumluluk için src/data/templates'tan re-export yapan ince katman.
 * Yeni kod src/data/templates/index.ts'den import etmeli.
 */

export {
  STUDIO_TEMPLATES,
  getTemplateById,
  filterTemplates,
  type StudioTemplate,
  type TemplateFilters,
  type TemplateTier,
  type TemplateSeason,
} from "@/data/templates";