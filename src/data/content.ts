// Content of the original portfolio site (home, /photos, /about).
// Media is served from the original Webflow CDN.

export const CDN = "https://cdn.prod.website-files.com/6915dc055cdc24f198ca9061/";
const CDN_VIDEO = "https://cdn.prod.website-files.com/6915dc055cdc24f198ca9061%2F";

export type Shape = "portrait" | "landscape" | "square";

export type ImageMedia = {
  type: "image";
  name: string;
  shape: Shape;
  file: string;
  /** responsive variant widths available as "<file>-p-<w>.avif" */
  widths: number[];
  /** intrinsic width of the original file */
  full: number;
  alt: string;
};

export type VideoMedia = {
  type: "video";
  name: string;
  shape: Shape;
  /** base id; resolves to _mp4.mp4, _webm.webm and _poster.0000000.jpg */
  id: string;
};

export type Media = ImageMedia | VideoMedia;

export const imageSrc = (m: ImageMedia) => CDN + m.file;
export const imageSrcSet = (m: ImageMedia) => {
  const base = CDN + m.file.replace(/\.avif$/, "");
  return [...m.widths.map((w) => `${base}-p-${w}.avif ${w}w`), `${CDN + m.file} ${m.full}w`].join(", ");
};
export const videoSources = (id: string) => ({
  mp4: `${CDN_VIDEO}${id}_mp4.mp4`,
  webm: `${CDN_VIDEO}${id}_webm.webm`,
  poster: `${CDN_VIDEO}${id}_poster.0000000.jpg`,
});

export type CreditPart = { text: string; href?: string };
export type Credit = { label: string; parts: CreditPart[] };

export type Project = {
  title: string;
  category: string;
  year: string;
  description: string;
  credits: Credit[];
  media: Media[];
};

export const heroTitle = "swiss based web and brand designer. currently working at stuiq.";

export const projects: Project[] = [
  {
    title: "3 linden",
    category: "branding, webdesign",
    year: "2024",
    description:
      "for the restaurant 3 linden i had the opportunity to created a new corporate identity. working on everything from the name, photography, branding and communication. combining the restaurant's long history with a modern and bold refurbishment. for that we created a bold logo that always seems to be in the way. a mysterious place that you need to experience in person.",
    credits: [
      { label: "agency", parts: [{ text: "absolut agentur", href: "https://www.absolutagentur.ch/" }] },
      { label: "client", parts: [{ text: "p1 gastronomie" }] },
      { label: "website", parts: [{ text: "3linden.ch", href: "https://www.3linden.ch/" }] },
      { label: "photos", parts: [{ text: "zoomer agency", href: "https://www.zoomer-agency.ch/#" }] },
    ],
    media: [
      { type: "image", name: "li_001.jpg", shape: "portrait", file: "6918931c44bb884aa73394c1_d7e8fba53016ff022d4cae8b94adb93e_li_001.avif", widths: [500, 800, 1080], full: 1200, alt: "Person in a black blazer and white shirt holding a red crate of bottles above their head against a black and white checkered background." },
      { type: "image", name: "li_002.jpg", shape: "landscape", file: "6918931c82d8ac534e282995_040bb367e619a90af3bfd5bfe23c5c87_li_002.avif", widths: [500, 800, 1080], full: 1200, alt: "Person holding a glass of red wine and a glass of rosé wine close to their face, with red lipstick and manicured nails." },
      { type: "image", name: "li_003.jpg", shape: "square", file: "6918931c146c173d30ffe8d9_11d80d2747a20b01b03e4fbfc6acbdb1_li_003.avif", widths: [500, 800, 1080], full: 1200, alt: "Hand with rings and red nail polish holding a champagne glass as sparkling wine is poured, causing foam to overflow." },
      { type: "image", name: "li_004.jpg", shape: "square", file: "6918931c6b91791f1356bb08_4dc7f285194cdffa4c900b6e3c2728ff_li_004.avif", widths: [500, 800, 1080], full: 1200, alt: "Three folded brochures in shades of red and pink, each labeled with a red sticker reading '31 LINDEN' in bold black letters." },
      { type: "image", name: "li_005.jpg", shape: "square", file: "6918931cda41987910c1551b_2ea2fdcc16bbb1d3cd7ed43c6aa56f33_li_005.avif", widths: [500, 800, 1080], full: 1200, alt: "Red business cards on black surface with contact details for Manuel Jakob and bold text '3 LINDEN'." },
      { type: "video", name: "li_006.mp4", shape: "landscape", id: "6a061bb9344f535e43c02e6e_li_006_compressed" },
      { type: "image", name: "li_007.jpg", shape: "square", file: "6918931c179cab8358da7c3a_b5f97460ad717ec813818daf52332f5c_li_007.avif", widths: [500, 800, 1080], full: 1200, alt: "Red tape with black text '3 LINDEN' printed repeatedly, partially unrolled on a textured gray surface." },
      { type: "image", name: "li_008.jpg", shape: "portrait", file: "6918931c741e352fafccc445_d01dbf5887a73f9b7f2766c62eb81d83_li_008.avif", widths: [500, 800, 1080], full: 1200, alt: "Person chopping sliced radishes on a wooden cutting board with microgreens and cherry tomatoes nearby." },
      { type: "image", name: "li_009.jpg", shape: "landscape", file: "6918931cef6aa64b910d2cd5_9d7f7dbaf41032dfbccdd7aeb878447c_li_009.avif", widths: [500, 800, 1080], full: 1200, alt: "Hand holding a smartphone displaying a Snapchat photo of a man holding a beer bottle at a party with a '3 LINDEN' label over his eyes." },
      { type: "image", name: "li_010.jpg", shape: "landscape", file: "6918931cf9814be60b0e3063_3ab7491e93b89aa206e099f8ef61ac20_li_010.avif", widths: [500, 800, 1080], full: 1200, alt: "The letterhead of 3 Linden features the logo prominently placed on the left side." },
      { type: "image", name: "li_011.jpg", shape: "square", file: "6918931c0be729368e03756c_a6ece7a536d27328083da9b131da64a2_li_011.avif", widths: [500, 800, 1080], full: 1200, alt: "Stack of dark green placemats with a large black number 3." },
    ],
  },
  {
    title: "cityparking",
    category: "webdesign, campaign",
    year: "2024",
    description:
      "Webdesign and brand refresh for the parking provider Cityparking St.Gallen. The project centered around the redesign of the website, which defined the visual system for both the updated logo, the campaign and all the print measures. The design is based on a strict grid, a black-and-white foundation with a neon pink accent color derived from the parking house architecture.",
    credits: [
      { label: "agency", parts: [{ text: "absolut agentur", href: "https://www.absolutagentur.ch/" }] },
      { label: "client", parts: [{ text: "city parking st.gallen ag" }] },
      { label: "website", parts: [{ text: "cityparking.ch", href: "https://cityparking.ch/" }] },
      { label: "photos", parts: [{ text: "zoomer agency", href: "https://www.zoomer-agency.ch/" }] },
    ],
    media: [
      { type: "image", name: "ci_001.jpg", shape: "square", file: "692dbf7e55e0d0c820f7aed5_f2ecbbc11de5c9eec44064ea89871d84_ci_001.avif", widths: [500], full: 1200, alt: "Bold black arrow pointing diagonally down and to the right on a white background." },
      { type: "image", name: "ci_002.jpg", shape: "square", file: "692dbf7e1cfef9d62a123da2_51a138c920bab966db80a617197c57c8_ci_002.avif", widths: [500, 800, 1080], full: 1200, alt: "Modern laptop displaying a website for CityParking St.Gallen with a vintage-style hair salon photo and parking availability info." },
      { type: "video", name: "ci_003.mp4", shape: "landscape", id: "692dbfcb2795a7a799bd7c56_ci_003" },
      { type: "image", name: "ci_004.jpg", shape: "landscape", file: "692dbf7e31dffef85a484c0e_07893e9150b9822a32e3f9c4a4d85fe8_ci_004.avif", widths: [500, 800, 1080], full: 1200, alt: "Outdoor billboard with three panels advertising CITYPARKING, showing scenes labeled Feel Nähe, Feel Qualität, and Feel Ambiente." },
      { type: "image", name: "ci_005.jpg", shape: "square", file: "692dbf7e890cb0e8f4c5c868_fc9cb5ab53e8b78edc9ede5c35be3634_ci_005.avif", widths: [500, 800, 1080], full: 1200, alt: "Pink tree-shaped car air freshener labeled 'Feel Ahhh' on a textured dark car seat." },
      { type: "video", name: "ci_006.mp4", shape: "landscape", id: "6996e379bfef6d300c916f20_ci_006_resized" },
      { type: "video", name: "ci_007.mp4", shape: "landscape", id: "692e9a3b76d95b978a859b6e_ci_007_compressed" },
      { type: "video", name: "ci_008.mp4", shape: "square", id: "692dc159757d3938fde5f303_ci_008" },
      { type: "video", name: "ci_009.mp4", shape: "landscape", id: "692e9a31e2fa8307d14df5de_ci_009_compressed" },
      { type: "video", name: "ci_010.mp4", shape: "square", id: "692dc16243f7e58e5154bef7_ci_010" },
      { type: "image", name: "ci_011.jpg", shape: "portrait", file: "692dbf7e1cfef9d62a123db9_0765f8ffb8211cd2fcefb71411c5305d_ci_011.avif", widths: [500, 800, 1080], full: 1200, alt: "Top-down view of a metal stairwell with pink walls and stairs, featuring a person holding a phone going down." },
    ],
  },
  {
    title: "razzo",
    category: "naming, branding",
    year: "2025",
    description:
      "development of a new visual identity and communication concept, for the new restaurant in the globus st.gallen. The branding combines a modern monospaced typeface with simple layouts, connecting the historic context of the location with their modern interpretation of classic cuisine.",
    credits: [
      { label: "agency", parts: [{ text: "absolut agentur", href: "https://www.absolutagentur.ch/" }] },
      { label: "client", parts: [{ text: "p1 gastronomie" }] },
      { label: "website", parts: [{ text: "razzo.sg", href: "https://www.razzo.sg/" }] },
      { label: "photos", parts: [{ text: "zoomer agency", href: "https://www.zoomer-agency.ch/" }, { text: ", " }, { text: "lia koeppel", href: "https://liakoeppel.ch/" }] },
    ],
    media: [
      { type: "video", name: "rz_001.mp4", shape: "square", id: "692e9a4c7277e0127a8affb0_rz_001_compressed" },
      { type: "image", name: "rz_002.jpg", shape: "portrait", file: "6918977e1b5246af9163eed2_b3a8393bfbbd566bcb4622e00d6528b5_rz_002.avif", widths: [500, 800, 1080], full: 1200, alt: "Tall gray menu card with 'razzo ace restaurant bar' text on a brown tablecloth with utensils, glass, and candle in the background." },
      { type: "image", name: "rz_003.jpg", shape: "landscape", file: "6918977eefe905a2c13a1b8d_78b02c464a3db9dfe2224dee107bb15a_rz_003.avif", widths: [500, 800, 1080], full: 1200, alt: "Open laptop on a gray table displaying a website with a black-and-white photo of a woman drinking and a color photo of hands holding martini glasses." },
      { type: "image", name: "rz_004.jpg", shape: "portrait", file: "6918977ec61d5179c4b619ec_df968610095dff9b8f36aa4f097fca79_rz_004.avif", widths: [500, 800, 1080], full: 1200, alt: "Blurry waiter carrying drinks past two patrons seated at tables in a stylish restaurant with modern pendant lights and large windows showing urban buildings outside." },
      { type: "image", name: "rz_005.jpg", shape: "portrait", file: "6918977ee6f5e0ff6c5aeceb_7ac73b0e561a84e09f8543bb1277b2eb_rz_005.avif", widths: [500, 800, 1080], full: 1200, alt: "Table set with a lit candle in a glass holder, a folded menu labeled 'ROTWEIN ITALIEN', a clear glass tumbler, silver cutlery, and a tall vase with small white and purple flowers." },
      { type: "video", name: "rz_006.mp4", shape: "landscape", id: "692e9a53044de3f0b7f6113d_rz_006_compressed" },
      { type: "image", name: "rz_007.jpg", shape: "portrait", file: "6918977e90ad3863d96bbe4e_b9ffd64f4b04b7bb63a743ffddfe22bb_rz_007.avif", widths: [500, 800, 1080], full: 1200, alt: "Purple rectangular sign hanging by a clip with the text 'café restaurant bar razzo' on a dark background." },
      { type: "image", name: "rz_008.jpg", shape: "landscape", file: "6918977ef2f2a3f94a472795_93cad2713b3937b998b537842938c5db_rz_008.avif", widths: [500, 800, 1080], full: 1200, alt: "People dining together at a table with plates of food, glasses of water, cocktails, and a bottle of red wine being poured into a wine glass." },
      { type: "image", name: "rz_009.jpg", shape: "square", file: "6918977e09253715879b9c9f_410164dbb3e60bce1df7705114397889_rz_009.avif", widths: [500, 800, 1080], full: 1200, alt: "Black text on a white background that reads 'razzo' with a small star above and 'café restaurant bar' below." },
      { type: "image", name: "rz_010.jpg", shape: "square", file: "6918977ebececebacad38198_77edf201ecbeb9e82c36c2f065f3e62e_rz_010.avif", widths: [500, 800], full: 1200, alt: "Person with curly hair sitting on a dark green leather couch, reading a dark blue menu, wearing a matching purple corduroy outfit and black ankle boots." },
      { type: "image", name: "rz_011.jpg", shape: "landscape", file: "6918977edc8769f00b371057_bd02d5661d7c141366480172e017f7b9_rz_011.avif", widths: [500, 800, 1080], full: 1200, alt: "Exterior of a stone building with a large window covered by a gray awning, featuring text about a tartare recipe with café de Paris sauce, and outdoor umbrellas partially visible on the left." },
      { type: "video", name: "rz_006.mp4", shape: "portrait", id: "69e9cfae70d7b0fdd0144c72_rz_012" },
      { type: "image", name: "rz_013.jpg", shape: "square", file: "6918977e00fbbbef4295b62d_da85a36f8a404d1687e367d6655ada05_rz_013.avif", widths: [500, 800, 1080], full: 1200, alt: "Two stacks of gray business cards for 'Trazzo cafe restaurant bar' displaying contact information and reservation details in black typewriter-style font." },
      { type: "image", name: "rz_014.jpg", shape: "portrait", file: "6918977f9cde70490c1de7df_ec4f1b6e18eb83ecb528f2bee1bc22ea_rz_014.avif", widths: [500, 800, 1080], full: 1200, alt: "Server wearing a gray Cazzo apron holding three bottles of champagne, two Ruinart and one Veuve Clicquot." },
      { type: "image", name: "rz_015.jpg", shape: "square", file: "6918977e2d5c606051c41b5f_1fd33d534f0aed9c249239d701038fff_rz_015.avif", widths: [500, 800, 1080], full: 1200, alt: "Metal pedestal bowl filled with black matchboxes with a brown stripe, placed on a wooden surface." },
      { type: "image", name: "rz_016.jpg", shape: "portrait", file: "6918977f13a76fb895a581ff_7ae5b079f65b60bec4affbc67ebee9b8_rz_016.avif", widths: [500, 800, 1080], full: 1200, alt: "Entrance of a stone building with a glass door showing glowing round pendant lights inside and sign reading 'Lazzo café restaurant bar.'" },
    ],
  },
  {
    title: "ae open day",
    category: "branding, webdesign, code",
    year: "2026",
    description:
      "For Aerne Engineering's AE Open Day event, I created the branding using a custom pixel shader tool. The goal was a flexible identity that could be adapted over multiple years. By combining robotic visuals with bold graphic elements, the design merges progressive aesthetics with a strong technical foundation. in this project i was able to do everything from concept, branding to webdelevopment.",
    credits: [
      { label: "Agency", parts: [{ text: "absolut agentur", href: "https://www.absolutagentur.ch/" }] },
      { label: "client", parts: [{ text: "aerne engineering", href: "https://aerne-ag.ch/" }] },
      { label: "website", parts: [{ text: "ae-openday.ch", href: "https://ae-openday.ch/2026" }] },
      { label: "text", parts: [{ text: "ebbe & flut", href: "https://www.ebbeundflut.ch/" }] },
    ],
    media: [
      { type: "video", name: "ae_001.mp4", shape: "landscape", id: "6a16b9fc76dae3dc707cf948_ae_001" },
      { type: "image", name: "ae_002.jpg", shape: "square", file: "6a0f1fcd73855fc815a2d605_ae_002.avif", widths: [500], full: 1200, alt: "Pink tiles spelling out The Future Is Wired on a gray concrete floor with a blue line." },
      { type: "image", name: "ae_003.jpg", shape: "landscape", file: "6a0f1fce0280cbf79109644f_51bed9a227f604aeae1fb106930383fe_ae_003.avif", widths: [500, 800, 1080], full: 1800, alt: "Laptop on a table showing a pixelated figure with text about an open day event on screen." },
      { type: "image", name: "ae_004.jpg", shape: "square", file: "6a0f1fcff3a4da5bdec3eeff_ae_004.avif", widths: [500], full: 1200, alt: "Humanoid robot raises fist on stage while an audience watches and applauds at a technology event." },
      { type: "image", name: "ae_005.jpg", shape: "portrait", file: "6a0f1fcd7c706806ad1d1f41_ae_005.avif", widths: [500], full: 1200, alt: "Stacked colorful cubes with text: OPEN DAY and THE FUTURE IS WILD in an industrial setting." },
      { type: "video", name: "ae_006.mp4", shape: "landscape", id: "6a16ba913787970fe6e1d900_aa_006-cut" },
      { type: "image", name: "ae_007.jpg", shape: "square", file: "6a0f1fcdc9e25f1688c1a746_ae_007.avif", widths: [500], full: 1200, alt: "Takeaway coffee cup with black lid and label reading Open Day in pink on light background." },
      { type: "image", name: "ae_008.jpg", shape: "square", file: "6a0f1fcff3a4da5bdec3ef25_ae_008.avif", widths: [500], full: 1200, alt: "Warehouse aisle with a pixelated sign saying Welcome to the Open Day in pink and yellow tones." },
      { type: "video", name: "ae_009.mp4", shape: "square", id: "6a0f22e8319341edb55ca1b7_ae_009-compressed" },
      { type: "image", name: "ae_010.jpg", shape: "portrait", file: "6a0f1fcd73717cdff59a9173_ae_010.avif", widths: [500], full: 1200, alt: "Hand holding event badge with lanyard labeled 'Open Day' and name Ben Wroth." },
      { type: "image", name: "ae_011.jpg", shape: "square", file: "6a0f1fcd1773c24b47897fce_ae_011.avif", widths: [500], full: 1200, alt: "Robot speaker with glowing face presenting to an audience at an event with a futuristic screen backdrop." },
      { type: "video", name: "ae_012.mp4", shape: "landscape", id: "6a0f2303ea0b00b625f4fcd3_ae_012" },
      { type: "image", name: "ae_013.jpg", shape: "portrait", file: "6a0f1fcf0280cbf7910964de_42e8949f464a0eaf47d765d6625dafd9_ae_013.avif", widths: [500], full: 1200, alt: "Three flags with pixelated designs and text: OPEN DAY 26, THE FUTURE IS WILD, against a cloudy sky." },
      { type: "image", name: "ae_014.jpg", shape: "square", file: "6a101bb0a54fadfeea16befd_d1894fce2469ad4d6b321a036c14137f_ae_014.avif", widths: [500], full: 1200, alt: "Transparent bag of dried apple slices with colorful geometric label reading Open Day and The Future Is Wild." },
    ],
  },
];

export const photosIntro =
  "my fascination for the obscure and strange is probably the most important reason for my passion for photography. the search for moments and things that raise more questions than they answer. so here is a collection of non-related images.";

export const photos: Media[] = [
  { type: "image", name: "ph_001.jpg", shape: "portrait", file: "692d8c08806dd897915723e6_ph_001.avif", widths: [500], full: 686, alt: "Person blindfolded holding a stick, preparing to hit a colorful donkey-shaped piñata on the ground." },
  { type: "video", name: "ph_002.mp4", shape: "square", id: "69e1e83427659841a90c762c_ph_002" },
  { type: "image", name: "ph_003.jpg", shape: "portrait", file: "692d8c089f625906a74bb152_ph_003.avif", widths: [500], full: 686, alt: "Person with short pink hair looking away, sitting inside a cardboard structure partially covered with black tape." },
  { type: "image", name: "ph_004.jpg", shape: "portrait", file: "692d8c07d8cc0a6bb7e6f841_ph_004.avif", widths: [500], full: 686, alt: "Black and white photo of a large high-rise apartment building with a swimming pool in the foreground and a person walking near the pool." },
  { type: "image", name: "ph_005.jpg", shape: "landscape", file: "692d8c087b8d5e2a68917dc6_ph_005.avif", widths: [500], full: 686, alt: "Person wearing a brown corduroy jacket and blue jeans standing next to a urinal in a restroom with a tiled wall." },
  { type: "image", name: "ph_006.jpg", shape: "square", file: "692d8c07edd4add25a4f1d76_ph_006.avif", widths: [500], full: 686, alt: "Empty outdoor basketball court with a single hoop in front of an unfinished multi-story brick building and trees." },
  { type: "image", name: "ph_007.jpg", shape: "square", file: "692d8c07da6d13c1e3209d2b_ph_007.avif", widths: [500], full: 686, alt: "A bare foot and lower leg in jeans hanging from a white awning against a black sky at night." },
  { type: "image", name: "ph_008.jpg", shape: "landscape", file: "692d8c08cf753df7a5934e29_ph_008.avif", widths: [500], full: 686, alt: "Person wearing white gloves spraying red paint from a can onto a gray concrete wall." },
  { type: "image", name: "ph_009.jpg", shape: "square", file: "692d8c07e1d62b05a32619d1_ph_009.avif", widths: [500], full: 686, alt: "Old refrigerator covered with a worn cloth and a rustic wooden bench nearby on rocky ground inside a dark cave or rock shelter." },
  { type: "image", name: "ph_010.jpg", shape: "portrait", file: "692d8c076eeaafd67e3b4921_ph_010.avif", widths: [500], full: 686, alt: "Black and white photo of a boat named '42 k' anchored on water viewed from above near a waterslide with a kayak floating nearby." },
  { type: "video", name: "ph_011.mp4", shape: "portrait", id: "692d8ea7950915109b743f0d_ph_011" },
  { type: "image", name: "ph_012.jpg", shape: "portrait", file: "692d8c08954fadadfaac6fc9_ph_012.avif", widths: [500], full: 686, alt: "Bright green motorcycle parked behind a wire fence near a river with a cloudy sky." },
  { type: "image", name: "ph_013.jpg", shape: "portrait", file: "692d8c07107fc43db0af61fb_ph_013.avif", widths: [500], full: 686, alt: "Black and white photo of a man standing barefoot on grass, looking to the left." },
  { type: "image", name: "ph_014.jpg", shape: "square", file: "692d8c0709cc3e0d4608a919_9629a7b539b1276f1e2ee98e59045556_ph_014.avif", widths: [500], full: 686, alt: "Group of people on a boat with a person wearing a monkey mask and life jacket, and a crew member in a green and black uniform." },
  { type: "image", name: "ph_015.jpg", shape: "portrait", file: "692d8c086b736315e5f642df_ph_015.avif", widths: [500], full: 686, alt: "Narrow stream flowing between grassy hills with dense red and green vegetation and a small stone building on the right hillside." },
  { type: "image", name: "ph_016.jpg", shape: "square", file: "692d8c08057b0f00fd2bcb78_ph_016.avif", widths: [500], full: 686, alt: "Buffalo partially hidden among dense foliage in a natural forest setting, shown in black and white." },
  { type: "image", name: "ph_017.jpg", shape: "square", file: "692d8c08a7a0b47f3a2b5dc0_ph_017.avif", widths: [500], full: 686, alt: "Close-up of a black car hood with a Mercedes-Benz emblem held on by multiple pieces of black tape above the front grille." },
  { type: "image", name: "ph_018.jpg", shape: "landscape", file: "692d8c08475114c2c82db243_ph_018.avif", widths: [500], full: 686, alt: "Person in a striped coat and colorful cap lying face down on grass at night next to a bottle." },
  { type: "image", name: "ph_019.jpg", shape: "portrait", file: "692d8c08d441b99ecddf72a9_ph_019.avif", widths: [500], full: 686, alt: "Black and white photo of a large group of climbers trekking in a line across a snowy mountain slope beneath rugged rock formations." },
  { type: "image", name: "ph_020.jpg", shape: "portrait", file: "692d8c08d7c379b6f294676f_ph_020.avif", widths: [500], full: 686, alt: "Construction worker wearing a yellow helmet and jacket spraying water with a hose at a partially demolished building." },
  { type: "image", name: "ph_021.jpg", shape: "square", file: "692d8c08e0a3f54ab8bde1b7_ph_021.avif", widths: [500], full: 686, alt: "Black and white image of a car's front wheel and fender parked on a tiled driveway next to a potted plant with long leaves and a cactus." },
  { type: "image", name: "ph_022.jpg", shape: "landscape", file: "692d8c086db98c2510cc0e12_ph_022.avif", widths: [500], full: 686, alt: "Person in a black leather jacket holding a telephone receiver with a Ferris wheel lit up at night in the background." },
  { type: "video", name: "ph_023.mp4", shape: "portrait", id: "692d9a3fc7b24bc4d04be91d_ph_023" },
  { type: "image", name: "ph_024.jpg", shape: "portrait", file: "692d8c08ac804096e886e0b0_ph_024.avif", widths: [500], full: 686, alt: "Black and white image of old, rough stone walls with mist or smoke creating an eerie atmosphere and blurry trees in the background." },
  { type: "image", name: "ph_025.jpg", shape: "square", file: "692d8c089bcbcb0c462dd2a3_bd4a35f25bcc6a0b80a63b75f4747f59_ph_025.avif", widths: [500], full: 686, alt: "Outdoor clock mounted on a wooden pole surrounded by rocky terrain and green vegetation under a partly cloudy sky." },
  { type: "image", name: "ph_026.jpg", shape: "portrait", file: "692d8c087dce19fafaa45d4f_ph_026.avif", widths: [500], full: 686, alt: "Low-angle view of a person in a white tank top and dark pants standing with hands by their sides, partially obscured by bright light above." },
  { type: "image", name: "ph_027.jpg", shape: "portrait", file: "692d8c088f862c7eb6c1751f_ph_027.avif", widths: [500], full: 686, alt: "Black and white photo of a protest with people wearing face masks, one holding a 'Black Lives Matter' sign." },
  { type: "image", name: "ph_028.jpg", shape: "portrait", file: "692d8c08dd8ff3256c010100_ph_028.avif", widths: [500], full: 686, alt: "Black and white photo of a bicycle covered in plastic sheets secured with tape, surrounded by four traffic cones on the pavement." },
  { type: "image", name: "ph_029.jpg", shape: "landscape", file: "692d8c09739346479c2b9f2c_ph_029.avif", widths: [500], full: 686, alt: "Green grassy field scattered with small white flowers and several pigeons with a white plastic container standing in the grass." },
  { type: "image", name: "ph_030.jpg", shape: "portrait", file: "692d9aa82fb022ed7e06320d_ph_030.avif", widths: [500], full: 686, alt: "Person sitting on a chair wearing a house costume, with bare legs and arms, holding a cigarette in one hand against a dark background." },
  { type: "image", name: "ph_031.jpg", shape: "portrait", file: "692d8c082d96b14b0884539c_ph_031.avif", widths: [500], full: 686, alt: "Black and white photo of an ornate traditional Asian building facade with decorative carvings and vertical poles extending from the roof, partially obscured by scaffolding." },
  { type: "image", name: "ph_032.jpg", shape: "portrait", file: "692d8c09f8d2711b16e67177_ph_032.avif", widths: [500], full: 686, alt: "Soccer field with goalpost and net in the foreground, large modern apartment building and trees in the background under an overcast sky." },
  { type: "image", name: "ph_033.jpg", shape: "portrait", file: "692d8c095958e8e20257b050_ph_033.avif", widths: [500], full: 686, alt: "Black and white photo of an old building with a small balcony and door sealed with bricks." },
  { type: "image", name: "ph_034.jpg", shape: "landscape", file: "692d8c0902a69288e7cba132_ph_034.avif", widths: [500], full: 686, alt: "Man with curly hair and mustache holding partially eaten pink cotton candy, colorful character balloons in the dark background." },
  { type: "image", name: "ph_035.jpg", shape: "portrait", file: "692d8c0992de3498df85bb33_18056872ea55960b1644a40af4405372_ph_035.avif", widths: [500], full: 686, alt: "Coastal scene with turquoise water, a sandy beach, palm trees, and a cactus in the foreground, with a forested island in the background." },
  { type: "image", name: "ph_036.jpg", shape: "portrait", file: "692d8c097b8d5e2a68917de2_9f4150c16e6908b29a4ef8c141a77adf_ph_036.avif", widths: [500], full: 686, alt: "Person bending down on pavement near scooters and parked cars with tall palm trees and clear blue sky in the background." },
  { type: "image", name: "ph_037.jpg", shape: "portrait", file: "692d8c0936c93fd83ca14a2e_ph_037.avif", widths: [500], full: 686, alt: "Close-up of two curved glass and metal greenhouse domes under a cloudy sky." },
  { type: "image", name: "ph_038.jpg", shape: "portrait", file: "692d8c09fd3d9fdee573be4c_0a8590ee487c1e890a495d6145017e31_ph_038.avif", widths: [500], full: 686, alt: "Close-up of a bicycle wheel covered in thick mud, tangled debris, and cobwebs." },
  { type: "image", name: "ph_039.jpg", shape: "landscape", file: "692d8c09950915109b739872_ph_039.avif", widths: [500], full: 686, alt: "Close-up of a person performing a wheelie on an electric scooter on a leaf-strewn pavement at night." },
  { type: "image", name: "ph_040.jpg", shape: "portrait", file: "692d8c09cfca4deb9726e491_ph_040.avif", widths: [500], full: 686, alt: "Black-and-white photo showing a burning bicycle wheel on the ground with a person’s legs and polished shoes nearby." },
  { type: "image", name: "ph_041.jpg", shape: "portrait", file: "692d8c0984963ec4ae12d22b_ph_041.avif", widths: [500], full: 686, alt: "Two small covered rail cars on a narrow track ascending through a forested hillside." },
  { type: "image", name: "ph_042.jpg", shape: "landscape", file: "692d8c09086a117530e58154_ph_042.avif", widths: [500], full: 686, alt: "Black and white photo of a calm river with stone steps on the left and large crumpled bags in the foreground beside the water." },
  { type: "image", name: "ph_043.jpg", shape: "square", file: "692d8c093e6f2057b402c37a_ph_043.avif", widths: [500], full: 686, alt: "Tall white elevated view tower with a metal ladder and canopy, set against green tree foliage and overcast sky." },
  { type: "image", name: "ph_044.jpg", shape: "portrait", file: "692d8c0a2b31e145abc775d8_ph_044.avif", widths: [500], full: 686, alt: "Close-up of a person standing on uneven rocks next to a rusty ladder, wearing jeans and white shoes." },
  { type: "image", name: "ph_045.jpg", shape: "portrait", file: "692d8c0ac3c83e12f57fec00_ph_045.avif", widths: [500], full: 686, alt: "Two people playing an Ibach piano with their hands on the keys and their feet near the pedals." },
  { type: "image", name: "ph_046.jpg", shape: "square", file: "692d8c0ae118ada4d1aa411b_ph_046.avif", widths: [500], full: 686, alt: "Cargo delivery by helicopter above a valley with mountains in the background." },
  { type: "image", name: "ph_047.jpg", shape: "portrait", file: "692d8c0ada6d13c1e3209e03_ph_047.avif", widths: [500], full: 686, alt: "Empty outdoor swimming pool with large rocks in foreground and tall buildings and trees in the background." },
  { type: "image", name: "ph_048.jpg", shape: "portrait", file: "692d8c0a5ee476efb18f63ac_ph_048.avif", widths: [500], full: 686, alt: "Building under construction covered with white protective sheeting and metal scaffolding, against a clear blue sky." },
  { type: "image", name: "ph_049.jpg", shape: "portrait", file: "692d8c0affcf7f8c51c22f54_ph_049.avif", widths: [500], full: 686, alt: "Silver sedan parked near fallen metal roofing sheets, cordoned off with warning tape, with trees in background under a cloudy sky." },
  { type: "image", name: "ph_050.jpg", shape: "square", file: "692d8c0a3307041eff868905_a1afa464e795f05aef46aa61a52f1d21_ph_050.avif", widths: [500], full: 686, alt: "Silver minivan partially hidden by dense foliage in a tropical forest with tall palm trees in the background." },
  { type: "image", name: "ph_051.jpg", shape: "square", file: "69d2a538eb6727aec5991e93_ph_051.avif", widths: [500], full: 686, alt: "Abandoned van partially covered by dense foliage and surrounded by tall palm trees in a forested area." },
  { type: "image", name: "ph_052.jpg", shape: "portrait", file: "69d2a53875c38f7e79544167_ph_052.avif", widths: [500], full: 686, alt: "Covered arcade game machine labeled Wheel of Boxing near a waterfront at sunset with cloudy sky and distant hills." },
  { type: "image", name: "ph_053.jpg", shape: "portrait", file: "69d2a5386c31fde4aa240952_ph_053.avif", widths: [500], full: 686, alt: "Stone bell tower partially submerged in a lake with mountains and trees in the background under a cloudy sky." },
  { type: "image", name: "ph_054.jpg", shape: "square", file: "69d2a53822e3b552489b4463_ph_054.avif", widths: [500], full: 686, alt: "Close-up of a bike wheel heavily covered in spider webs and debris, with another tire visible in the background." },
  { type: "image", name: "ph_055.jpg", shape: "landscape", file: "69d2a5381a984020bed5dbc5_ph_055.avif", widths: [500], full: 686, alt: "Small car driving on a curving road surrounded by lush green hills and large conifer tree under a partly cloudy sky." },
  { type: "image", name: "ph_056.jpg", shape: "portrait", file: "69d2a53871e0258c4c342d97_ph_056.avif", widths: [500], full: 686, alt: "White and blue pedal boat resting on dry ground in a wooded area with tall pine trees." },
  { type: "image", name: "ph_057.jpg", shape: "square", file: "69e0f612e23201a9ba4e39c8_ph_057.avif", widths: [500], full: 686, alt: "Small golden spirit house shrine on ground near rocks with green plants and ocean in the background." },
];

export const aboutIntro =
  "my work focuses on branding and webdesign. with a clear visual language and systematic use of typography, i strive to build design solutions that feel timeless and work seamlessly across digital and analog spaces.";
