import type { StudioTemplate } from "./types";

/**
 * KATMAN 1 — Amiral Gemisi Stüdyolar (30 sahne).
 * Kaynak içerik: docs/content/flagship-scenes.md
 * Promptlara PRESERVE_INSTRUCTION render sırasında otomatik eklenir.
 */
export const FLAGSHIP_TEMPLATES: StudioTemplate[] = [
  // ── TAKI ──────────────────────────────────────────────────
  {
    id: "kadife-kutu-spot",
    title: "Kadife Kutu",
    description: "Gece mavisi kadife kutu, tek spot ışık, mücevherci klasiği.",
    bestFor: ["jewelry"],
    tags: ["kadife", "stüdyo", "dramatik", "klasik"],
    tier: "flagship",
    preview: { from: "#0b1128", via: "#1c2454", to: "#d9a86c" },
    prompt:
      "Nestled on deep midnight-blue velvet inside an open luxury jewelry presentation box. A single warm spotlight from upper right carves soft velvet texture and makes metal and gemstones sparkle with crisp specular highlights. Surrounding darkness falls off gently. Macro product photography, 100mm lens, f/4, razor-sharp product, intimate and precious mood.",
    sortOrder: 1,
  },
  {
    id: "islak-siyah-mermer",
    title: "Islak Siyah Mermer",
    description: "Su damlalı parlak siyah mermer; yüksek kontrast, ayna yansıması.",
    bestFor: ["jewelry", "watch"],
    tags: ["mermer", "ıslak", "dramatik", "yansıma"],
    tier: "flagship",
    preview: { from: "#26282c", via: "#0e0f12", to: "#000000" },
    prompt:
      "Placed on glossy black marble sprinkled with fine water droplets. Cool white key light from the left, mirror-like reflection beneath the product, droplets catching tiny highlights like scattered diamonds. Dark charcoal gradient background, high-contrast luxury editorial style, 85mm lens, low camera angle, cinematic and bold.",
    sortOrder: 2,
  },
  {
    id: "altin-saten-dalga",
    title: "Altın Saten",
    description: "Akışkan altın saten kıvrımları; sıcak, zengin ve dokunsal.",
    bestFor: ["jewelry", "beauty"],
    tags: ["saten", "altın", "sıcak", "zarif"],
    tier: "flagship",
    preview: { from: "#b8722c", via: "#e8b64f", to: "#f6e6c8" },
    prompt:
      "Resting in the flowing folds of liquid gold satin fabric. Warm soft light from above creating rich amber highlights and deep honey shadows along the fabric waves. Opulent and tactile, shallow depth of field with satin folds melting into creamy bokeh, 90mm macro lens, warm color grade, ultra-premium jewelry campaign aesthetic.",
    sortOrder: 3,
  },
  {
    id: "buz-kristal",
    title: "Buz & Kristal",
    description: "Buz bloğu ve kristal kırıkları; soğuk, saf, pırlanta hissi.",
    bestFor: ["jewelry", "watch"],
    tags: ["buz", "soğuk", "minimal", "ferah"],
    tier: "flagship",
    preview: { from: "#a9d8ea", via: "#dff3fa", to: "#ffffff" },
    prompt:
      "Displayed on a slab of crystal-clear ice with scattered ice shards and frost. Cold blue-white lighting with a subtle prism light streak crossing the frame, refractions glinting through the ice, faint cool mist in the background. Clean arctic luxury mood, macro sharpness on the product, 100mm lens, high-key cool tones.",
    sortOrder: 4,
  },
  {
    id: "makro-cig-damlasi",
    title: "Sabah Çiyi",
    description: "Koyu yeşil yaprakta makro çekim; çiy damlaları, taze doğal ışık.",
    bestFor: ["jewelry"],
    tags: ["doğa", "makro", "yeşil", "taze"],
    tier: "flagship",
    preview: { from: "#0f3d24", via: "#1f6b3d", to: "#bfe3c0" },
    prompt:
      "Lying on a large dark-green tropical leaf covered in morning dew drops. Fresh diffused daylight from behind and left, dew acting as tiny lenses, deep emerald tones with soft natural bokeh of foliage behind. Organic fine-jewelry editorial, extreme macro detail, 105mm macro lens, f/5.6, dewy and pristine.",
    sortOrder: 5,
  },
  {
    id: "kuyumcu-vitrini",
    title: "Gece Vitrini",
    description: "Lüks kuyumcu vitrini; cam yansımaları, şehir ışıkları bokeh.",
    bestFor: ["jewelry", "watch"],
    tags: ["vitrin", "gece", "bokeh", "şehir"],
    tier: "flagship",
    preview: { from: "#0e1638", via: "#3a2163", to: "#e3b56b" },
    prompt:
      "Presented on a mirrored display pedestal inside a high-end jeweler's window at night. Focused display spotlights from above, subtle glass reflections in the foreground, warm golden city lights melting into large bokeh circles in the background. Prestigious boutique atmosphere, 85mm lens, f/2, sharp product against dreamy night glow.",
    sortOrder: 6,
  },

  // ── SAAT ──────────────────────────────────────────────────
  {
    id: "deri-defter-flatlay",
    title: "Beyefendi Masası",
    description: "Deri defter, dolma kalem, espresso; üstten sıcak flat lay.",
    bestFor: ["watch", "accessory"],
    tags: ["deri", "flat lay", "sıcak", "klasik"],
    tier: "flagship",
    preview: { from: "#5a3620", via: "#8a5a34", to: "#d9b98c" },
    prompt:
      "Top-down flat lay on a cognac leather journal beside a fountain pen and a small espresso cup on dark walnut wood. Warm window light from the left with soft long shadows, gentleman's desk aesthetic, rich browns and brass tones, perfectly orthogonal composition, 50mm lens from directly above, crisp fabric and leather textures.",
    sortOrder: 7,
  },
  {
    id: "karbon-gece",
    title: "Karbon Performans",
    description: "Karbon fiber doku, keskin çapraz ışık; sportif ve teknik.",
    bestFor: ["watch", "accessory"],
    tags: ["karbon", "koyu", "sportif", "maskülen"],
    tier: "flagship",
    preview: { from: "#0a0a0c", via: "#1c1e22", to: "#2f6fb0" },
    prompt:
      "Mounted on a matte carbon-fiber surface with a brushed metal edge. Hard-edged cool white light raking from the right revealing the carbon weave, deep black background with a thin blue accent light tracing the product silhouette. Technical performance aesthetic, motorsport energy, 85mm lens, low angle, high micro-contrast and precise reflections.",
    sortOrder: 8,
  },
  {
    id: "viski-kutuphane",
    title: "Kütüphane & Viski",
    description: "Meşe kütüphane, kristal bardak; amber ışık, klasik lüks.",
    bestFor: ["watch"],
    tags: ["kütüphane", "amber", "lüks", "klasik"],
    tier: "flagship",
    preview: { from: "#3b2311", via: "#7a4a1f", to: "#d9a441" },
    prompt:
      "Resting on aged oak beside a crystal whisky glass with a large ice sphere, blurred leather-bound books behind. Warm amber tungsten lighting from the side, gentle smoke haze in the air, old-money library atmosphere, deep mahogany and gold palette, 85mm lens, f/2.8, refined masculine luxury campaign.",
    sortOrder: 9,
  },
  {
    id: "pilot-seyahat",
    title: "Pilot & Seyahat",
    description: "Eski dünya haritası, pirinç pusula; keşif nostaljisi.",
    bestFor: ["watch", "accessory"],
    tags: ["seyahat", "vintage", "harita", "nostalji"],
    tier: "flagship",
    preview: { from: "#5c4a2e", via: "#a9834c", to: "#e8cfa0" },
    prompt:
      "Placed on a vintage world map beside a brass compass and worn leather gloves. Golden late-afternoon light from the left, soft shadows, adventurous explorer mood with warm sepia undertones, subtle film grain, 50mm lens at 45 degrees, tactile paper and brass textures, heritage aviation campaign style.",
    sortOrder: 10,
  },
  {
    id: "islak-beton-neon",
    title: "Islak Beton & Neon",
    description: "Yağmur sonrası beton, neon yansımaları; urban gece enerjisi.",
    bestFor: ["watch", "bag", "accessory"],
    tags: ["neon", "urban", "gece", "ıslak"],
    tier: "flagship",
    preview: { from: "#0c0d12", via: "#c23f8e", to: "#1fb6c9" },
    prompt:
      "Standing on wet raw concrete after rain, reflecting magenta and teal neon signs from off-frame. Moody urban night scene, colored rim lights outlining the product, shallow puddle mirroring highlights, dark atmospheric background with soft neon bokeh, 35mm lens, low angle, cinematic cyber-noir energy with sharp product focus.",
    sortOrder: 11,
  },
  {
    id: "yat-guvertesi",
    title: "Yat Güvertesi",
    description: "Tik güverte, gün batımı denizi; golden hour yaz lüksü.",
    bestFor: ["watch", "accessory", "bag"],
    tags: ["deniz", "golden hour", "yaz", "tik"],
    tier: "flagship",
    preview: { from: "#c98a3f", via: "#f0c27a", to: "#2a5877" },
    prompt:
      "On polished teak yacht decking with the open sea blurred behind at golden hour. Low warm sunlight from behind right creating a glowing rim light and long soft shadows, gentle sun flare, luxurious summer riviera mood, deep blue and warm gold palette, 85mm lens, f/2.8, aspirational lifestyle luxury.",
    sortOrder: 12,
  },

  // ── ÇANTA ─────────────────────────────────────────────────
  {
    id: "paris-kaldirimi",
    title: "Paris Sabahı",
    description: "Parisian kafe masası, kruvasan ve gazete; şık şehir yaşamı.",
    bestFor: ["bag", "accessory"],
    tags: ["paris", "kafe", "lifestyle", "sabah"],
    tier: "flagship",
    preview: { from: "#f2e6cf", via: "#e8d9b0", to: "#8fa377" },
    prompt:
      "Placed on a marble bistro table at a Parisian sidewalk café, croissant and folded newspaper nearby, Haussmann facades softly blurred behind. Fresh morning sunlight with crisp gentle shadows, chic effortless elegance, creamy warm palette with sage green accents, 50mm lens, f/2.2, editorial street-style luxury.",
    sortOrder: 13,
  },
  {
    id: "butik-vitrin",
    title: "Butik Vitrin",
    description: "Lüks mağaza vitrini; sıcak spot, traverten kaide, prestij.",
    bestFor: ["bag", "accessory"],
    tags: ["vitrin", "butik", "spot", "prestij"],
    tier: "flagship",
    preview: { from: "#e8ddc7", via: "#d8c6a0", to: "#b89a68" },
    prompt:
      "Displayed on a low cream travertine pedestal in a luxury boutique window. Warm focused spotlights from above, soft pool of light around the pedestal, elegant beige wall with subtle architectural shadow, minimalist high-fashion retail presentation, 85mm lens, straight-on composition, immaculate and prestigious.",
    sortOrder: 14,
  },
  {
    id: "monokrom-studyo",
    title: "Monokrom Editoryal",
    description: "Ürünle aynı tonda seamless fon; ton-sür-ton moda editoryali.",
    bestFor: ["bag", "accessory", "beauty"],
    tags: ["monokrom", "stüdyo", "editorial", "minimal"],
    tier: "flagship",
    preview: { from: "#e5e5e0", via: "#c9c9c2", to: "#8f8f88" },
    prompt:
      "Centered on a seamless studio backdrop color-matched to the product's dominant tone (tone-on-tone monochrome). Large soft key light from upper left, single elegant drop shadow, subtle background vignette, high-fashion magazine editorial minimalism, medium format look, 80mm lens, perfect symmetry and flawless detail.",
    sortOrder: 15,
  },
  {
    id: "otel-lobisi",
    title: "Grand Otel",
    description: "Mermer lobi, avize bokeh; beş yıldızlı sessiz lüks.",
    bestFor: ["bag"],
    tags: ["otel", "mermer", "altın", "klasik lüks"],
    tier: "flagship",
    preview: { from: "#f0e6d2", via: "#d9c49a", to: "#a9822f" },
    prompt:
      "Resting on a polished calacatta marble console in a grand hotel lobby, golden chandelier lights melting into warm bokeh behind. Soft ambient luxury lighting with a gentle key from the left, champagne and cream palette, five-star hospitality elegance, 85mm lens, f/2, quiet opulence with tack-sharp product.",
    sortOrder: 16,
  },
  {
    id: "sonbahar-parki",
    title: "Sonbahar Parkı",
    description: "Vintage park bankı, turuncu yapraklar; sıcak sonbahar ışığı.",
    bestFor: ["bag", "accessory"],
    tags: ["sonbahar", "park", "doğal", "sıcak"],
    tier: "flagship",
    preview: { from: "#c9601f", via: "#e0912f", to: "#8a3c14" },
    prompt:
      "On a weathered wooden park bench scattered with orange and amber autumn leaves, tree-lined path blurred behind. Low warm afternoon sun from behind creating a golden halo and long soft shadows, cozy cinematic fall atmosphere, rich rust and caramel palette, 85mm lens, f/2.5, lifestyle catalog warmth.",
    sortOrder: 17,
  },
  {
    id: "backstage-podyum",
    title: "Defile Arka Sahnesi",
    description: "Moda haftası backstage'i; spot, sis, couture enerjisi.",
    bestFor: ["bag", "accessory"],
    tags: ["podyum", "moda", "dramatik", "sis"],
    tier: "flagship",
    preview: { from: "#050506", via: "#1c1c1f", to: "#8a8a8f" },
    prompt:
      "Spotlit on a dark glossy runway-backstage floor with faint haze in the air. Single dramatic white spotlight from high above, strong pool of light with darkness beyond, subtle silhouettes of stage rigging in the deep background, fashion-week energy, high contrast, 50mm lens, low dramatic angle, couture campaign intensity.",
    sortOrder: 18,
  },

  // ── AKSESUAR ──────────────────────────────────────────────
  {
    id: "plaj-sert-golge",
    title: "Akdeniz Güneşi",
    description: "Sıcak traverten, sert öğle gölgeleri; yaz editoryal trendi.",
    bestFor: ["accessory", "beauty", "bag"],
    tags: ["yaz", "sert gölge", "kum", "sıcak"],
    tier: "flagship",
    preview: { from: "#e8c896", via: "#d99b5c", to: "#b5602f" },
    prompt:
      "On warm sand-toned travertine under intense midday Mediterranean sun. Hard directional light casting sharp elongated shadows, possibly a palm-leaf shadow pattern crossing the corner, sun-bleached warm whites and terracotta, summer editorial harsh-light trend, 50mm lens, bold minimal composition, vivid and crisp.",
    sortOrder: 19,
  },
  {
    id: "sanat-gazetesi",
    title: "Sanat Editörü Masası",
    description: "Sanat dergisi sayfaları, espresso; entelektüel flat lay.",
    bestFor: ["accessory", "watch", "beauty"],
    tags: ["flat lay", "gazete", "sanat", "entelektüel"],
    tier: "flagship",
    preview: { from: "#efe9da", via: "#cfc7b0", to: "#3a362e" },
    prompt:
      "Flat lay on open art-magazine pages with elegant typography, a ceramic espresso cup and reading glasses nearby. Soft diffused daylight from the top left, gentle paper texture and ink tones, curated creative-editor desk aesthetic, muted ivory and black palette, top-down 50mm composition, sophisticated print-culture mood.",
    sortOrder: 20,
  },
  {
    id: "brut-beton",
    title: "Brütalist Beton",
    description: "Ham beton bloklar, mimari kompozisyon; sert modern minimalizm.",
    bestFor: ["accessory", "watch", "beauty"],
    tags: ["beton", "minimal", "mimari", "modern"],
    tier: "flagship",
    preview: { from: "#c6c6c2", via: "#9c9c98", to: "#5c5c58" },
    prompt:
      "Staged on stacked raw concrete blocks forming an architectural composition. Cool neutral daylight from the right with one crisp geometric shadow, brutalist gallery minimalism, textured grey palette letting the product's color dominate, 85mm lens, precise negative space, bold contemporary design-magazine look.",
    sortOrder: 21,
  },
  {
    id: "tropik-golge",
    title: "Tropik Gölge Oyunu",
    description: "Krem duvarda palmiye gölgeleri; ferah resort havası.",
    bestFor: ["accessory", "beauty", "bag"],
    tags: ["tropik", "gölge", "resort", "ferah"],
    tier: "flagship",
    preview: { from: "#f2ece0", via: "#dce8d4", to: "#8fb37a" },
    prompt:
      "On a cream plaster ledge against a sunlit wall with sharp monstera-leaf shadows dancing across it. Bright natural sunlight, warm white and soft green palette, breezy tropical resort mood, elegant interplay of light and shadow, 50mm lens, minimal styling, airy premium summer campaign.",
    sortOrder: 22,
  },
  {
    id: "galeri-kaidesi",
    title: "Sanat Galerisi",
    description: "Beyaz küp galeri, kaide üstünde sanat eseri muamelesi.",
    bestFor: ["accessory", "jewelry", "beauty"],
    tags: ["galeri", "kaide", "minimal", "sanat"],
    tier: "flagship",
    preview: { from: "#ffffff", via: "#f0f0ee", to: "#d6d6d2" },
    prompt:
      "Presented as an artwork on a white museum pedestal in an empty gallery space. Even soft gallery lighting with a single refined drop shadow, vast white negative space, subtle wall texture, conceptual art-exhibition framing, 50mm lens, centered composition with generous headroom, quiet reverence and modern prestige.",
    sortOrder: 23,
  },
  {
    id: "gece-mavisi-podyum",
    title: "Gece Mavisi Podyum",
    description: "Lacivert kadife fon, geometrik podyumlar; zarif gece sahnesi.",
    bestFor: ["accessory", "jewelry", "beauty"],
    tags: ["podyum", "lacivert", "gece", "zarif"],
    tier: "flagship",
    preview: { from: "#0c1330", via: "#1b2454", to: "#caa551" },
    prompt:
      "On a cluster of matte geometric podiums in deep navy tones against a midnight-blue velvet backdrop. Cool moonlight-like key from upper left with a warm golden accent light from behind right, floating dust particles glinting subtly, elegant nocturnal stage mood, 85mm lens, refined contrast, premium evening campaign.",
    sortOrder: 24,
  },

  // ── PARFÜM & KOZMETİK ─────────────────────────────────────
  {
    id: "su-halkalari",
    title: "Su Aynası",
    description: "Sığ su yüzeyi, halkalar ve kusursuz yansıma; saf ferahlık.",
    bestFor: ["beauty", "jewelry"],
    tags: ["su", "yansıma", "ferah", "saf"],
    tier: "flagship",
    preview: { from: "#cfe8f2", via: "#eaf6fb", to: "#ffffff" },
    prompt:
      "Standing in shallow still water with delicate concentric ripples radiating outward and a perfect mirror reflection below. Soft cool daylight with a gentle gradient sky-blue background, tiny water droplets on the product, fresh and pure aquatic mood, 85mm lens at water level, serene symmetry, pristine skincare-campaign clarity.",
    sortOrder: 25,
  },
  {
    id: "ipek-gul-yapragi",
    title: "İpek & Gül",
    description: "Pudra ipek, dağılmış gül yaprakları; romantik ve yumuşak.",
    bestFor: ["beauty", "jewelry"],
    tags: ["ipek", "gül", "romantik", "pudra"],
    tier: "flagship",
    preview: { from: "#f6d9dd", via: "#eab8c2", to: "#f3e6d8" },
    prompt:
      "Lying on blush-pink silk with scattered fresh rose petals around it. Dreamy soft light from above left, delicate shadows in the silk folds, romantic powdery palette of rose and ivory, gentle haze glow, refined femininity, 90mm macro lens, f/2.8, luxurious beauty-editorial softness.",
    sortOrder: 26,
  },
  {
    id: "arka-isik-cam",
    title: "Işık Kırılması",
    description: "Güçlü arka ışıkla içi aydınlanan cam; dramatik minimalizm.",
    bestFor: ["beauty"],
    tags: ["arka ışık", "cam", "minimal", "dramatik"],
    tier: "flagship",
    preview: { from: "#141414", via: "#2a2a2a", to: "#d98a3a" },
    prompt:
      "Backlit on a smooth dark surface so light passes through the product's glass and liquid, making it glow from within like a lantern. Deep charcoal background, thin rim highlights tracing the silhouette, a warm caustic light pattern cast in front of the bottle, dramatic minimalism, 100mm lens, mysterious premium fragrance-campaign mood.",
    sortOrder: 27,
  },
  {
    id: "mermer-spa",
    title: "Mermer Spa",
    description: "Beyaz mermer, okaliptüs, hafif buhar; temiz spa lüksü.",
    bestFor: ["beauty"],
    tags: ["spa", "mermer", "okaliptüs", "temiz"],
    tier: "flagship",
    preview: { from: "#f5f3ee", via: "#e2ece3", to: "#a9c2ab" },
    prompt:
      "On white honed marble beside a fresh eucalyptus sprig and a folded cream towel, faint steam drifting in the background. Bright airy daylight, clean spa-sanctuary atmosphere, soft whites and sage greens, gentle shadows, wellness luxury aesthetic, 50mm lens, breathing negative space, immaculate freshness.",
    sortOrder: 28,
  },
  {
    id: "pencere-golgesi",
    title: "Öğleden Sonra Işığı",
    description: "Pencereden vuran sert ışık şeridi; sıcak, atmosferik trend.",
    bestFor: ["beauty", "accessory"],
    tags: ["pencere", "sert gölge", "sıcak", "atmosferik"],
    tier: "flagship",
    preview: { from: "#e8d3a8", via: "#c9a465", to: "#6b4a24" },
    prompt:
      "On a warm beige plaster surface struck by a hard beam of late-afternoon window light, casting a sharp window-frame shadow across the scene. Deep warm contrast between sunlit gold and soft shadow, floating dust motes in the beam, intimate sunlit-apartment mood, 50mm lens, editorial harsh-light aesthetic, evocative and warm.",
    sortOrder: 29,
  },
  {
    id: "siyah-akrilik-damla",
    title: "Islak Siyah Sahne",
    description: "Parlak siyah akrilik, damlalar, keskin yansıma; gece estetiği.",
    bestFor: ["beauty", "jewelry"],
    tags: ["siyah", "ıslak", "yansıma", "gece"],
    tier: "flagship",
    preview: { from: "#050506", via: "#181820", to: "#5b3a7a" },
    prompt:
      "On high-gloss wet black acrylic scattered with water beads, a crisp mirror reflection beneath. Single cool spotlight from above with a faint violet accent light from the side, droplets sparkling against darkness, sleek nocturnal elegance, high contrast, 85mm lens, low angle, iconic dark fragrance-advertising style.",
    sortOrder: 30,
  },
];
