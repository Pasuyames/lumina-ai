/**
 * İLHAM GALERİSİ — "Hazır Stüdyolar"
 *
 * Her şablonun arkasında, kullanıcıya gösterilmeyen bir `prompt` saklıdır.
 * Kullanıcı bir karta tıkladığında bu prompt otomatik seçilir ve yüklediği
 * ürünle birlikte doğrudan Nano Banana 2 (görsel üretim) modeline gönderilir.
 *
 * `referenceImage`: galeride gösterilecek örnek görsel (public/templates/*).
 * Görseller henüz eklenmediyse UI zarif bir gradyan placeholder gösterir.
 */

export interface StudioTemplate {
  id: string;
  title: string;
  description: string;
  /** Hangi kategorilerde önerilir (filtre için). */
  bestFor: string[];
  referenceImage?: string;
  /** Kullanıcıya gizli — render promptu. */
  prompt: string;
}

export const STUDIO_TEMPLATES: StudioTemplate[] = [
  {
    id: "marble-luxe",
    title: "Mermer Lüks",
    description: "Cilalı beyaz mermer zemin, yumuşak gün ışığı, zarif gölgeler.",
    bestFor: ["jewelry", "watch", "accessory"],
    prompt:
      "Place the product on a polished white Carrara marble surface with subtle grey veining. Soft diffused daylight from the upper left, gentle natural shadows, a faint reflection on the marble. Minimalist luxury editorial style, shallow depth of field, neutral warm tones, premium e-commerce hero shot, ultra sharp product focus.",
  },
  {
    id: "warm-wood",
    title: "Sıcak Ahşap",
    description: "Doğal meşe doku, sıcak altın ışık, organik ve davetkâr.",
    bestFor: ["watch", "bag", "accessory"],
    prompt:
      "Place the product on a natural oak wood surface with visible warm grain. Warm golden hour side lighting, soft long shadows, cozy organic atmosphere. Earthy premium tones, lifestyle catalog aesthetic, crisp product detail, gentle bokeh background.",
  },
  {
    id: "studio-black",
    title: "Stüdyo Siyah",
    description: "Derin siyah zemin, dramatik spot ışık, yüksek kontrast prestij.",
    bestFor: ["jewelry", "watch"],
    prompt:
      "Place the product on a seamless deep matte black background. Single dramatic spotlight from above creating elegant highlights and rich falloff, high contrast luxury jewelry advertising style, specular reflections on metal and gemstones, glossy reflective floor, cinematic and prestigious.",
  },
  {
    id: "soft-silk",
    title: "İpek Kumaş",
    description: "Akışkan krem ipek dokusu, pofuduk yumuşak ışık, butik his.",
    bestFor: ["jewelry", "accessory", "watch"],
    prompt:
      "Drape the product over flowing cream silk fabric with soft folds. Soft boxed studio lighting, delicate shadows, elegant tactile texture, refined boutique presentation, warm ivory palette, dreamy and sophisticated.",
  },
  {
    id: "nature-stone",
    title: "Doğa & Taş",
    description: "Pürüzlü doğal taş, yaprak gölgeleri, organik dış mekân hissi.",
    bestFor: ["bag", "accessory", "watch"],
    prompt:
      "Place the product on a rough natural stone slab outdoors. Dappled sunlight filtering through leaves casting organic shadows, fresh greenery softly blurred in the background, natural earthy luxury, sustainable brand mood, sharp product detail.",
  },
  {
    id: "pastel-podium",
    title: "Pastel Podyum",
    description: "Geometrik podyum, yumuşak pastel tonlar, modern minimalist.",
    bestFor: ["accessory", "jewelry", "bag"],
    prompt:
      "Place the product on a minimalist geometric podium in soft pastel tones (blush, sand, cream). Clean studio gradient background, soft even lighting, subtle drop shadow, modern contemporary e-commerce aesthetic, playful yet premium, crisp and clean.",
  },
];

export function getTemplateById(id: string): StudioTemplate | undefined {
  return STUDIO_TEMPLATES.find((t) => t.id === id);
}
