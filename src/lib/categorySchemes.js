import tinycolor from "tinycolor2";

const H = (c) => tinycolor(c).toHexString().toUpperCase();
const nearBlack = "#111111";
const charcoal = "#1C1F24";
const offWhite = "#F4F6F8";

function isWarm(seed) {
  const h = tinycolor(seed).toHsl().h; // 0–360
  return h >= 20 && h <= 70; // красн-оранж-жёлт
}

function steelFrom(seed) {
  // «стальной серый» адаптивный
  const s = tinycolor.mix("#7A869A", seed, 20); // базовый steel + примесь seed
  return H(s.desaturate(20));
}

// --- DARK MODE: всегда с чёрным и светлыми ---
export function buildDarkMode(seedHex) {
  const seed = tinycolor(seedHex).saturate(15);
  const bgDark = H(tinycolor(nearBlack));
  const surface = H(tinycolor("#1B2430"));
  const accent = H(seed);
  const gray = H(tinycolor("#9AA4B2").darken(10));
  const light = H(tinycolor(offWhite));
  // порядок квадратов как у твоих карт: яркий не первый
  return [bgDark, surface, accent, gray, light];
}

// --- FUTURISTE: чёрный + стальной серый + неон вокруг seed ---
export function buildFuturiste(seedHex) {
  const seed = tinycolor(seedHex).saturate(35);
  const neon = H(seed.brighten(10));
  const steel = steelFrom(seedHex);
  const black = H(nearBlack);
  const neo2 = H(seed.spin(180).saturate(40)); // комплементарный неон
  return [neon, neo2, steel, black, H("#0D0F13")];
}

// --- ECCENTRIC: максимальные контрасты, всегда есть «почти чёрный» ---
export function buildEccentric(seedHex) {
  const seed = tinycolor(seedHex).saturate(40);
  const comp = seed.complement().saturate(40);
  const tri = seed.triad().map(H);
  const neon = H(seed.brighten(12));
  const dark = H(nearBlack);
  // берём seed, комплемент, один из триады, неон и near-black
  const palette = [H(seed), H(comp), tri[1], neon, dark];
  return palette.slice(0, 5);
}

// --- COZY: тёплые бежи и оливки, без чёрного ---
export function buildCozy(seedHex) {
  const seed = tinycolor(seedHex);
  const beige = tinycolor("#D9C7A6");
  const olive = tinycolor("#7E8B55");
  const warm1 = H(tinycolor.mix(seed, beige, 55).desaturate(20).lighten(8));
  const warm2 = H(tinycolor.mix(seed, olive, 45).desaturate(15).lighten(6));
  const warm3 = H(tinycolor(beige).darken(6));
  const warm4 = H(tinycolor(olive).lighten(6));
  const accent = H(seed.saturate(10).lighten(4));
  return [accent, warm1, warm2, warm3, warm4];
}

export function buildLuxe(seedHex) {
  const seed = tinycolor(seedHex).saturate(25).darken(5);
  const metal = isWarm(seedHex) ? "#D4AF37" /* gold */ : "#C0C7D1"; /* silver */
  const black1 = nearBlack;
  const black2 = charcoal;
  const ivory = "#F0EDE2"; // «слоновая кость»
  return [H(seed), metal, black1, black2, ivory]; // ровно 5
}

export function buildProfessional(seedHex) {
  const seed = tinycolor(seedHex).desaturate(45);
  const accent = H(seed.lighten(2)); // спокойный акцент
  const midGray = H(tinycolor("#8A93A2")); // средний серый
  const darkGray = H(tinycolor("#1E1E1E")); // тёмно-серый (вариативный допустим)
  const white = "#FFFFFF"; // обязателен
  return [accent, midGray, darkGray, white, offWhite]; // 5 и тоновый разброс
}
