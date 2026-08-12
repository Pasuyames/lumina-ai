/**
 * Prompt mimarlarının (analyze/creative/sales-set/architect) ortak talimat
 * blokları — tek doğru kaynak. Amaç: aynı kuralın 4 dosyada hafif farklı
 * wording'lerle kayması sorununu önlemek. Saf string sabitleri — "server-only"
 * içermez, network/env bağımlılığı yoktur.
 */

/** Vision/render çağrılarına giden tek bir referans görsel — base64 + mime. */
export interface ProductImage {
  data: string;
  mimeType: string;
}

/** Tüm prompt mimarlarının ortak rolü. */
export const ART_DIRECTOR_ROLE =
  "Sen lüks e-ticaret markaları için çalışan bir ürün fotoğrafçılığı sanat yönetmenisin.";

/**
 * Ürün algısını ucuzlatan zemin/ortam seçimlerini yasaklayan blok. Kasıtlı
 * olarak geniş bir palet sunar (sadece koyu taş/mermer değil) — dar bir liste
 * modelin sürekli aynı karanlık/dramatik mermer sahnesine yakınsamasına yol
 * açıyordu (kullanıcı geri bildirimi: "bu tarz mermer kompozisyonu pek hoşa
 * gitmedi"). Aydınlık/sıcak seçenekler de en az koyu/dramatik seçenekler kadar
 * "premium" sayılmalı.
 */
export const FORBIDDEN_CHEAP_SURFACES =
  "Ürün algısını UCUZLATAN sahnelerden kaçın: sıradan/rustik ahşap masa üstü, " +
  "dağınık ev ortamı, mutfak tezgâhı, ucuz plastik yüzeyler YASAK. Zemin daima " +
  "premium olmalı, ama tek bir kalıba (koyu mermer) sıkışma — geniş bir " +
  "palettten seç ve ürüne göre çeşitlendir: mermer/doğal taş (açık VEYA koyu " +
  "tonda), kadife, saten, cam, lake, fırçalanmış metal, yumuşak nötr stüdyo " +
  "fonu (bej/krem/gri), keten veya pamuklu doku, açık renkli pürüzsüz beton, " +
  "pastel tonlu seamless fon. Aydınlık ve sade bir sahne de en az koyu/dramatik " +
  "bir sahne kadar lüks olabilir. Ahşap yalnızca lüks bağlamda kabul edilebilir " +
  "(koyu ceviz, yüksek cila, butik vitrin sunumu).";

/** Lüks marka kampanyası dili ve kalite referans çıtası. */
export const LUXURY_CAMPAIGN_BAR =
  "Her promptu LÜKS MARKA KAMPANYASI diliyle yaz: high-end editorial/advertising " +
  "estetiği, kontrollü ve profesyonel kalitede aydınlatma, rafine renk paleti — ama bu KARANLIK/DRAMATİK " +
  "olmak zorunda demek değil; aydınlık, sade, gün ışığı hissi veren bir kurulum da " +
  "aynı ölçüde lüks olabilir, ürünün karakterine göre seç. Referans çıta: " +
  "Cartier/Rolex/Hermès kampanya fotoğrafçılığı — asla stok fotoğraf sıradanlığı.";

/**
 * Ürünün orijinalinin korunması şartı — render sahnesi değişir, ürün değişmez.
 * Kasıtlı olarak "yalnızca X değişebilir" kısmını içermez — akışlar (creative
 * atmosferi serbest bırakır, sales-set context'te kullanım bağlamı ekler, vb.)
 * bunu kendi trailing cümlesiyle tamamlar; aksi halde çelişkili talimat riski olur.
 */
export const PRESERVE_PRODUCT_INTEGRITY =
  "Ürünün ORİJİNAL şeklini, rengini, yapısını ve dokusunu KORUMASI gerektiğini vurgula.";

/**
 * Modele beklenen teknik spesifiklik SEVİYESİNİ göstermek için kalibrasyon
 * örnekleri — kopyalanacak şablon değil, taklit edilecek detay seviyesi.
 * Renza'nın hedef dikeylerine (takı, saat, gözlük, parfüm/kozmetik, küçük
 * deri eşya) göre seçilmiş 5 materyal arketipi.
 */
export const CALIBRATION_EXAMPLES =
  "Kalibrasyon için örnek detay seviyesi (bu örnekleri KOPYALAMA, sadece " +
  "spesifiklik seviyesini örnek al, kendi ürününe göre yeniden yaz):\n" +
  '- Metalik/yansıtıcı bir ürün için (takı, saat kasası): "a single ' +
  "45-degree softbox positioned camera-left casts a warm 3200K key light " +
  "across the brushed steel surface, producing a controlled linear " +
  "highlight along its edge while a cooler 5600K fill from the right " +
  "prevents the shadow side from going fully black, with a faint mirrored " +
  'reflection of the product visible on the glossy surface beneath it"\n' +
  '- Cam/şeffaf bir ürün için (gözlük camı, parfüm şişesi): "a diffused ' +
  "overhead light source creates a soft gradient highlight along the " +
  "curved glass surface, with a subtle secondary refraction visible " +
  "through the transparent body, and a thin bright rim-light along the " +
  'edges to define the glass silhouette against the background"\n' +
  '- Taş/faset bir ürün için (mücevher taşı, kristal): "a small focused ' +
  "point light, angled to catch two or three facets at once, produces " +
  "sharp internal light flashes characteristic of faceted stones, while " +
  "the remaining facets show darker tonal variation rather than flat, " +
  'uniform brightness"\n' +
  '- Deri/dokulu bir ürün için (saat kayışı, küçük deri eşya): "a low, ' +
  "raking side light at a shallow angle rakes across the leather grain, " +
  "casting tiny shadows into the natural texture and stitching to " +
  "emphasize tactile quality, with a soft sheen — not gloss — along the " +
  'highest points of the grain"\n' +
  '- Sıvı/kozmetik bir ürün için (parfüm, krem): "soft backlighting ' +
  "through the glass reveals the liquid's translucency and true color " +
  "saturation, with a gentle frontal fill keeping the label legible, and " +
  "a subtle caustic light pattern cast on the surface beneath the bottle " +
  'from light passing through the liquid"\n' +
  "Her promptun bu seviyede somut ışık/materyal etkileşimi içermesi " +
  "beklenir — genel geçer 'iyi aydınlatma' gibi ifadelerden kaçın.";

/**
 * Modele, ürünün ait olduğu sektörün profesyonel fotoğrafçılık kompozisyon
 * geleneklerini KENDİ bilgisiyle uygulamasını söyler — her sektör için elle
 * kompozisyon kuralı yazmak yerine, Gemini'nin zaten sahip olduğu sektörel
 * fotoğrafçılık bilgisini tetikler. CALIBRATION_EXAMPLES ile ÇAKIŞMAZ:
 * o teknik ışık/materyal detay seviyesini öğretir, bu ise sahne kompozisyonu/
 * ürün konumlandırma geleneğini yönlendirir — farklı eksenler.
 */
export const SECTOR_EXPERTISE_INSTRUCTION =
  "Ürünün ait olduğu sektörün (takı, saat, gözlük, parfüm/kozmetik, küçük " +
  "deri eşya gibi) profesyonel ürün fotoğrafçılığı kompozisyon geleneklerini " +
  "kendi uzmanlığınla uygula — örn. saat genelde bilekte belirli bir açıyla " +
  "veya deri bir yastık/kutu üzerinde eğik gösterilir; mücevher genelde " +
  "makro çekim ve kadife veya koyu zemin ister; gözlük genelde önden " +
  "simetrik veya 3/4 açıdan, camlarda hafif yansıma bırakılarak çekilir; " +
  "parfüm/kozmetik genelde şişenin/ambalajın netliği korunarak arkadan " +
  "veya yandan aydınlatılır. Bu sektörel bilgini, aşağıdaki sahne " +
  "talimatını ÇELİŞTİRMEDEN, onu zenginleştirmek için kullan.";

/**
 * Birden fazla referans görseli verildiğinde (kullanıcı ek açı fotoğrafı
 * yüklediyse) eklenen talimat — modele bunların AYNI fiziksel ürünün farklı
 * açıları olduğunu ve hepsinin birlikte değerlendirilmesi gerektiğini
 * söyler. SADECE images.length > 1 olduğunda çağıran taraf tarafından
 * metne eklenir (statik SYSTEM_PROMPT'lara gömülmez, çünkü görsel sayısı
 * çalışma zamanında belli olur).
 */
export const MULTI_ANGLE_INSTRUCTION =
  "Sana bu ürünün BİRDEN FAZLA fotoğrafı verildi — farklı açılardan (örn. " +
  "önden, yandan, arkadan) çekilmiş, hepsi AYNI fiziksel ürünü gösteriyor. " +
  "Ürünün gerçek 3 boyutlu formunu, görünmeyen yüzeylerini, oranlarını ve " +
  "tüm açılardan tutarlı detaylarını (desen/logo/donanım) anlamak için " +
  "TÜMÜNÜ birlikte değerlendir — sadece ilk görsele bakıp diğerlerini " +
  "görmezden gelme. Sahneyi yazarken/render ederken bu bütünsel 3 boyutlu " +
  "anlayışı kullan.";
