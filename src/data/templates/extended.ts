import type { StudioTemplate } from "./types";

export const EXTENDED_TEMPLATES: StudioTemplate[] = [
  {
    id: "marble-luxe",
    title: "Mermer Lüks",
    description: "Cilalı beyaz mermer zemin, yumuşak gün ışığı, zarif gölgeler.",
    bestFor: ["jewelry", "watch", "accessory"],
    tags: ["mermer", "lüks", "minimalist", "iç mekân"],
    tier: "extended",
    referenceImage: "/templates/marble-luxe.webp",
    prompt:
      "Place the product on a polished white Carrara marble surface with subtle grey veining. Soft diffused daylight from the upper left, gentle natural shadows, a faint reflection on the marble. Minimalist luxury editorial style, shallow depth of field, neutral warm tones, premium e-commerce hero shot, ultra sharp product focus.",
    sortOrder: 10,
  },
  {
    id: "warm-wood",
    title: "Sıcak Ahşap",
    description: "Doğal meşe doku, sıcak altın ışık, organik ve davetkâr.",
    bestFor: ["watch", "bag", "accessory"],
    tags: ["ahşap", "meşe", "sıcak", "doğal", "iç mekân"],
    tier: "extended",
    referenceImage: "/templates/warm-wood.webp",
    prompt:
      "Place the product on a natural oak wood surface with visible warm grain. Warm golden hour side lighting, soft long shadows, cozy organic atmosphere. Earthy premium tones, lifestyle catalog aesthetic, crisp product detail, gentle bokeh background.",
    sortOrder: 20,
  },
  {
    id: "studio-black",
    title: "Stüdyo Siyah",
    description: "Derin siyah zemin, dramatik spot ışık, yüksek kontrast prestij.",
    bestFor: ["jewelry", "watch"],
    tags: ["siyah", "dramatik", "spot ışık", "yüksek kontrast", "stüdyo"],
    tier: "extended",
    referenceImage: "/templates/studio-black.webp",
    prompt:
      "Place the product on a seamless deep matte black background. Single dramatic spotlight from above creating elegant highlights and rich falloff, high contrast luxury jewelry advertising style, specular reflections on metal and gemstones, glossy reflective floor, cinematic and prestigious.",
    sortOrder: 30,
  },
  {
    id: "soft-silk",
    title: "İpek Kumaş",
    description: "Akışkan krem ipek dokusu, pofuduk yumuşak ışık, butik hissi.",
    bestFor: ["jewelry", "accessory", "watch"],
    tags: ["ipek", "kumaş", "yumuşak", "butik", "iç mekân"],
    tier: "extended",
    referenceImage: "/templates/soft-silk.webp",
    prompt:
      "Drape the product over flowing cream silk fabric with soft folds. Soft boxed studio lighting, delicate shadows, elegant tactile texture, refined boutique presentation, warm ivory palette, dreamy and sophisticated.",
    sortOrder: 40,
  },
  {
    id: "nature-stone",
    title: "Doğa & Taş",
    description: "Pürüzlü doğal taş, yaprak gölgeleri, organik dış mekân hissi.",
    bestFor: ["bag", "accessory", "watch"],
    tags: ["taş", "doğa", "dış mekân", "organik", "yaprak"],
    tier: "extended",
    referenceImage: "/templates/nature-stone.webp",
    prompt:
      "Place the product on a rough natural stone slab outdoors. Dappled sunlight filtering through leaves casting organic shadows, fresh greenery softly blurred in the background, natural earthy luxury, sustainable brand mood, sharp product detail.",
    sortOrder: 50,
  },
  {
    id: "pastel-podium",
    title: "Pastel Podyum",
    description: "Geometrik podyum, yumuşak pastel tonlar, modern minimalist.",
    bestFor: ["accessory", "jewelry", "bag"],
    tags: ["pastel", "podyum", "geometrik", "modern", "minimalist", "stüdyo"],
    tier: "extended",
    referenceImage: "/templates/pastel-podium.webp",
    prompt:
      "Place the product on a minimalist geometric podium in soft pastel tones (blush, sand, cream). Clean studio gradient background, soft even lighting, subtle drop shadow, modern contemporary e-commerce aesthetic, playful yet premium, crisp and clean.",
    sortOrder: 60,
  },
];