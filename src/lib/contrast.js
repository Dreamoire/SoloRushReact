import tinycolor from "tinycolor2";

const toHex = (tc) => tinycolor(tc).toHexString().toUpperCase();
const H = (tc) => tinycolor(tc).toHexString().toUpperCase();

const K = {
  low: 0.5,
  light: 0.75,
  moderate: 0.9,
  medium: 1.0,
  high: 1.25,
  dark: 1.4,
};

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const scale = (arr, k) => arr.map((v) => Math.round(v * k));

export function buildContrastByType(seedHex, type, strength = "medium") {
  const k = K[strength] ?? 1.0;
  const s = tinycolor(seedHex);

  switch (type) {
    case "light-dark":
    default: {
      const deltas = scale([-22, -14, -6, 6, 14, 22], k);
      return deltas
        .map((d) => s.clone().lighten(d))
        .map(H)
        .slice(0, 5);
    }

    case "cold-warm": {
      const base = [-18, -9, 0, 9, 18];
      const ds = scale(base, k);
      const warmShift = 15 * k;
      return ds
        .map((d, i) => {
          const h = s.clone().toHsl().h;
          const shift = i < 2 ? -warmShift : warmShift;
          return tinycolor({
            ...s.clone().spin(shift).toHsl(),
            l: clamp01(s.toHsl().l + d / 100),
          });
        })
        .map(H)
        .slice(0, 5);
    }

    case "complementary": {
      const a = s.clone();
      const b = s.clone().spin(180);
      const mix = [80, 60, 40, 20, 0].map((m) => Math.round(m / (1 / k)));
      return mix.map((m) => H(tinycolor.mix(a, b, m)));
    }

    case "simultaneous": {
      const sat = Math.min(90, 50 * k);
      const accent1 = H(s.clone().saturate(sat).lighten(5));
      const accent2 = H(s.clone().spin(180).saturate(sat).lighten(5));
      const n1 = H(s.clone().desaturate(70).lighten(40));
      const n2 = H(s.clone().desaturate(60).lighten(25));
      const n3 = H(s.clone().desaturate(50).lighten(15));
      return [n1, n2, accent1, n3, accent2];
    }

    case "saturation": {
      const base = [-40, -20, 0, 20, 40];
      const ds = scale(base, k);
      return ds
        .map((d) => (d >= 0 ? s.clone().saturate(d) : s.clone().desaturate(-d)))
        .map(H);
    }

    case "extension": {
      const steps = scale([-15, -7, 0, 7, 15], k);
      return steps.map((d) => H(s.clone().lighten(d)));
    }
  }
}
export function contrastRatio(c1, c2) {
  const a = tinycolor(c1).getLuminance();
  const b = tinycolor(c2).getLuminance();
  const brightest = Math.max(a, b);
  const darkest = Math.min(a, b);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function isLight(color) {
  return tinycolor(color).isLight();
}

export function buildValueContrast(seedHex) {
  const seed = tinycolor(seedHex);
  const colors = [
    seed.clone().lighten(45).desaturate(30),
    seed.clone().lighten(25).desaturate(20),
    seed.clone().lighten(10),
    seed.clone().darken(15),
    seed.clone().darken(35),
    seed.clone().darken(50),
  ];
  return colors.map(toHex);
}

export function textOn(bg, minRatio = 4.5) {
  const white = "#FFFFFF";
  const black = "#000000";
  const ratioWhite = contrastRatio(bg, white);
  const ratioBlack = contrastRatio(bg, black);
  if (ratioWhite >= minRatio && ratioWhite > ratioBlack) return white;
  if (ratioBlack >= minRatio && ratioBlack > ratioWhite) return black;
  return ratioWhite > ratioBlack ? white : black;
}
