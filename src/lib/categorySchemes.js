import tinycolor from "tinycolor2";

const NEAR_BLACK = "#111111";
const NEAR_WHITE = "#F4F6F8";
const H = (tc) => tinycolor(tc).toHexString().toUpperCase();
const ensureNotBlack = (hex) =>
  tinycolor.equals(hex, "#000000") ? "#111111" : hex;
const BLACK = "#000000";
const CHARCOAL = "#1A1D22";
const hue = (c) => tinycolor(c).toHsl().h || 0;
const mk = (h, s, l) => tinycolor({ h, s, l });
const mixTo = (seed, target, w = 35) => tinycolor.mix(target, seed, w);
const NB = (hex) => (tinycolor.equals(hex, "#000000") ? "#111111" : hex);
const shiftHue = (tc, deg) =>
  tinycolor({ ...tc.toHsl(), h: (tc.toHsl().h + deg + 360) % 360 });

function isWarm(x) {
  const h = (typeof x === "string" ? tinycolor(x) : x).toHsl().h;
  return h >= 20 && h <= 70;
}

function steelFrom(seed) {
  const s = tinycolor.mix("#7A869A", seed, 20);
  return H(s.desaturate(20));
}

// === Guided palettes normalizer ===
// Приводит массив цветов к правилам каждой guidée-палитры
export function normalizeGuided(id, seedHex, colors = []) {
  const s = tinycolor(seedHex);
  const h = hue(s);
  const hex = (c) => H(c);
  let out = [...colors].map((c) => hex(c));

  // утилиты
  const ensureLen5 = () => {
    while (out.length < 5) out.push(out[out.length - 1] || "#FFFFFF");
    out = out.slice(0, 5);
  };
  const hasBlack = () => out.some((c) => tinycolor.equals(c, BLACK));
  const dropBlack = () => {
    out = out.filter((c) => !tinycolor.equals(c, BLACK));
  };
  const setBlack = (idx = 4) => {
    if (!hasBlack()) out[idx] = BLACK;
  };
  const inHue = (c, a, b) => {
    const x = hue(c);
    const A = (a + 360) % 360,
      B = (b + 360) % 360;
    return A <= B ? x >= A && x <= B : x >= A || x <= B;
  };

  switch (id) {
    case "cozy": {
      dropBlack();
      out = [
        H(mixTo(s, mk(h, 0.08, 0.92))),
        "#FFFFFF",
        H(mixTo(s, mk((h + 20) % 360, 0.15, 0.95), 25)),
        H(mixTo(s, mk(30, 0.22, 0.55), 30)),
        (function () {
          const coolDarkG = mk((h + 200) % 360, 0.35, 0.2);
          const darkBrown = mk(26, 0.45, 0.22);
          const weight = h >= 20 && h <= 70 ? 30 : 70;
          return NB(H(tinycolor.mix(darkBrown, coolDarkG, weight)));
        })(),
      ];
      ensureLen5();
      return out;
    }

    case "energy": {
      dropBlack();
      out = [
        H(mixTo(s, mk((h + 15) % 360, 0.9, 0.55))),
        H(mixTo(s, mk((h - 20 + 360) % 360, 0.92, 0.5))),
        H(mixTo(s, mk((h + 45) % 360, 0.95, 0.56))),
        H(mixTo(s, mk((h + 8) % 360, 0.75, 0.6), 45)),
        H(mixTo(s, mk((h + 5) % 360, 0.85, 0.3), 45)),
      ];
      ensureLen5();
      return out;
    }

    case "future":
    case "futuriste": {
      out = [
        H(mixTo(s, mk((h + 180) % 360, 0.95, 0.7), 25)),
        H(mixTo(s, mk((h + 170) % 360, 0.95, 0.5))),
        H(mixTo(s, mk((h + 205) % 360, 0.9, 0.55))),
        H(mixTo(s, mk((h + 150) % 360, 0.85, 0.48))),
        BLACK,
      ];
      ensureLen5();
      return out;
    }

    case "minimal":
    case "minimalist": {
      out = [
        "#FFFFFF",
        H(mixTo(s, mk((h + 30) % 360, 0.12, 0.95), 25)),
        H(mixTo(s, mk(h, 0.06, 0.9), 25)),
        H(mixTo(s, mk(h, 0.06, 0.72), 25)),
        BLACK,
      ];
      ensureLen5();
      return out;
    }

    case "nature": {
      dropBlack();
      const green = H(mixTo(s, mk(120, 0.78, 0.42), 20));
      if (!out.some((c) => inHue(c, 90, 150))) out[0] = green;
      out = [
        out[0] || green,
        NB(H(mixTo(s, mk((h + 30) % 360, 0.45, 0.4), 30))),
        NB(H(mixTo(s, mk((h + 20) % 360, 0.25, 0.78), 30))),
        NB(H(mixTo(s, mk((h + 40) % 360, 0.55, 0.62), 30))),
        NB(H(mixTo(s, mk((h + 210) % 360, 0.45, 0.58), 30))),
      ];
      // зелёный — самый насыщённый
      const sats = out.map((c) => tinycolor(c).toHsl().s);
      const mi = sats.indexOf(Math.max(...sats));
      if (mi !== 0) [out[0], out[mi]] = [out[mi], out[0]];
      ensureLen5();
      return out;
    }

    case "kiddo":
    case "enfantin": {
      dropBlack();
      out = [
        H(mixTo(s, mk((h + 10) % 360, 0.95, 0.55))),
        H(mixTo(s, mk((h + 60) % 360, 0.95, 0.55))),
        H(mixTo(s, mk((h + 140) % 360, 0.92, 0.52))),
        H(mixTo(s, mk((h + 210) % 360, 0.92, 0.54))),
        NB(H(mixTo(s, mk(18, 0.45, 0.8), 20))),
      ];
      ensureLen5();
      return out;
    }

    case "pro":
    case "professional": {
      out = [
        H(mixTo(s, s.clone().saturate(45).darken(5))),
        H(mixTo(s, s.clone().spin(180).saturate(30).lighten(5))),
        H(mixTo(s, s.clone().desaturate(40).lighten(18), 45)),
        H(mixTo(s, s.clone().desaturate(65).lighten(35), 45)),
        BLACK,
      ];
      ensureLen5();
      return out;
    }

    case "luxe": {
      const metal = h >= 20 && h <= 70 ? H("#D4AF37") : H("#C0C0C0");
      out = [
        H(mixTo(s, mk(350, 0.78, 0.4), 25)),
        H(mixTo(s, mk(270, 0.7, 0.38), 25)),
        CHARCOAL,
        BLACK,
        metal,
      ];
      ensureLen5();
      return out;
    }

    case "dark":
    case "darkmode":
    case "dark-mode": {
      const surface = H(mixTo(s, mk(220, 0.2, 0.22), 35));
      const midGrey = H(mixTo(s, mk(220, 0.1, 0.62), 35));
      const lightGrey = H(mixTo(s, mk(220, 0.08, 0.78), 35));
      const neon = H(
        mixTo(s, s.clone().complement().saturate(80).lighten(35), 10)
      );
      out = [CHARCOAL, surface, midGrey, lightGrey, neon];
      ensureLen5();
      return out;
    }

    default:
      ensureLen5();
      return out;
  }
}

export function buildDarkMode(seedHex) {
  const seed = tinycolor(seedHex);
  const neighbor = shiftHue(seed, isWarm(seed) ? -20 : 20);
  const darkest = H(NEAR_BLACK);
  const dark = H(tinycolor(seed).darken(35).desaturate(20));
  const accent = H(neighbor.saturate(25).lighten(10));
  const uiGrey = H(tinycolor(seed).desaturate(60).lighten(30));
  return [darkest, dark, accent, uiGrey, H(NEAR_WHITE)];
}

export function buildMinimalist(seedHex) {
  const s = tinycolor(seedHex);
  const h = hue(s);
  const white = "#FFFFFF";
  const warmNeutral = H(mixTo(s, mk((h + 30) % 360, 0.12, 0.95), 25));
  const softGrey = H(mixTo(s, mk(h, 0.06, 0.9), 25));
  const midGrey = H(mixTo(s, mk(h, 0.06, 0.72), 25));
  return [white, warmNeutral, softGrey, midGrey, BLACK];
}

export function buildFuturiste(seedHex) {
  const s = tinycolor(seedHex);
  const h = hue(s);
  const neon = H(mixTo(s, mk((h + 180) % 360, 0.95, 0.7), 25));
  const cyan = H(mixTo(s, mk((h + 170) % 360, 0.95, 0.5)));
  const blue = H(mixTo(s, mk((h + 205) % 360, 0.9, 0.55)));
  const green = H(mixTo(s, mk((h + 150) % 360, 0.85, 0.48)));
  return [neon, cyan, blue, green, BLACK];
}

export function buildEnergy(seedHex) {
  const s = tinycolor(seedHex);
  const h = hue(s);
  const orange = H(mixTo(s, mk((h + 15) % 360, 0.9, 0.55)));
  const red = H(mixTo(s, mk((h - 20 + 360) % 360, 0.92, 0.5)));
  const yellow = H(mixTo(s, mk((h + 45) % 360, 0.95, 0.56)));
  const warm = H(mixTo(s, mk((h + 8) % 360, 0.75, 0.6), 45));
  const deep = H(mixTo(s, mk((h + 5) % 360, 0.85, 0.3), 45));
  return [orange, red, yellow, warm, deep];
}

export function buildEccentric(seedHex) {
  const seed = tinycolor(seedHex).saturate(40);
  const comp = seed.complement().saturate(40);
  const tri = seed.triad().map(H);
  const neon = H(seed.brighten(12));
  const dark = H(NEAR_BLACK);
  const palette = [H(seed), H(comp), tri[1], neon, dark];
  return palette.slice(0, 5);
}

export function buildCozy(seedHex) {
  const s = tinycolor(seedHex);
  const h = tinycolor(seedHex).toHsl().h || 0;
  const grisClair = H(mixTo(s, mk(h, 0.08, 0.92)));
  const blanc = "#FFFFFF";
  const creme = H(mixTo(s, mk((h + 20) % 360, 0.15, 0.95), 25));
  const taupe = H(mixTo(s, mk(30, 0.22, 0.55), 30));
  const coolDarkG = mk((h + 200) % 360, 0.35, 0.2);
  const darkBrown = mk(26, 0.45, 0.22);
  const weight = h >= 20 && h <= 70 ? 30 : 70;
  const darkest = NB(H(tinycolor.mix(darkBrown, coolDarkG, weight)));
  return [grisClair, blanc, creme, taupe, darkest];
}

export function buildLuxe(seedHex) {
  const seed = tinycolor(seedHex);
  const warm = isWarm(seed);
  const black = H(NEAR_BLACK);
  const deep = H(seed.clone().saturate(25).darken(25));
  const metal = warm ? H(tinycolor("#D4AF37")) : H(tinycolor("#C0C0C0"));
  const cream = warm ? H(tinycolor("#FFF1D6")) : H(tinycolor("#EEF3FF"));
  return [deep, black, metal, cream, H(NEAR_WHITE)];
}

export function buildProfessional(seedHex) {
  const seed = tinycolor(seedHex);
  const darkGrey = H(seed.clone().desaturate(80).darken(35));
  const midGrey = H(seed.clone().desaturate(70).darken(10));
  const accent = H(seed.clone().desaturate(10).lighten(10));
  return [midGrey, accent, darkGrey, H(NEAR_WHITE), H("#F4F6F8")];
}

export function buildKiddo(seedHex) {
  const seed = tinycolor(seedHex);
  const red = H(shiftHue(seed, 10).saturate(50).lighten(15));
  const yellow = H(tinycolor("#FFD93B"));
  const blue = H(shiftHue(seed, 180).saturate(60).lighten(10));
  const green = H(shiftHue(seed, 100).saturate(45).lighten(10));
  const pink = H(shiftHue(seed, -20).saturate(55).lighten(20));
  return [red, yellow, green, blue, pink];
}

export function buildNature(seedHex) {
  const s = tinycolor(seedHex);
  const h = hue(s);
  const green = H(mixTo(s, mk(120, 0.78, 0.42), 20));
  const earth = NB(H(mixTo(s, mk((h + 30) % 360, 0.45, 0.4), 30)));
  const sand = NB(H(mixTo(s, mk((h + 20) % 360, 0.25, 0.78), 30)));
  const mutY = NB(H(mixTo(s, mk((h + 40) % 360, 0.55, 0.62), 30)));
  const mutB = NB(H(mixTo(s, mk((h + 210) % 360, 0.45, 0.58), 30)));
  return [green, earth, sand, mutY, mutB];
}
