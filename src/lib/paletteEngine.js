import tinycolor from "tinycolor2";
import { textOn, contrastRatio } from "./contrast";

function ensureContrast(bg, fg, min = 4.5, direction = "auto") {
  let c = tinycolor(bg);
  const fgHex = tinycolor(fg).toHexString();
  let guard = 0;

  while (contrastRatio(c.toHexString(), fgHex) < min && guard < 60) {
    if (direction === "lighter") c = c.lighten(2);
    else if (direction === "darker") c = c.darken(2);
    else c = c.isLight() ? c.darken(2) : c.lighten(2);
    guard++;
  }
  return c.toHexString().toUpperCase();
}

// --- light UI ---
export function buildWebPalette(seedHex, style = "default") {
  const seed = tinycolor(seedHex);

  const primary = seed.saturate(10);
  const surface = seed.desaturate(40).lighten(30);
  const bg = seed.desaturate(60).lighten(42);
  const muted = seed.desaturate(30).lighten(15);

  const text = textOn(bg, 4.5);
  const textOnSurface = textOn(surface, 4.5);
  const onPrimary = textOn(primary, 4.5);

  const bgSafe =
    contrastRatio(text, bg) < 4.5
      ? ensureContrast(bg, text, 4.5, "lighter")
      : bg.toHexString().toUpperCase();

  const surfSafe =
    contrastRatio(textOnSurface, surface) < 4.5
      ? ensureContrast(surface, textOnSurface, 4.5, "lighter")
      : surface.toHexString().toUpperCase();

  return {
    roles: {
      bg: bgSafe,
      surface: surfSafe,
      text,
      muted: muted.toHexString().toUpperCase(),
      primary: primary.toHexString().toUpperCase(),
      onPrimary,
    },
    swatches: [
      primary.toHexString().toUpperCase(),
      muted.toHexString().toUpperCase(),
      surfSafe,
      textOnSurface,
      bgSafe,
    ],
  };
}

// --- dark UI ---
export function buildDarkPalette(seedHex) {
  const seed = tinycolor(seedHex);

  const primary = seed.saturate(15);
  const bg = seed.desaturate(60).darken(40);
  const surface = seed.desaturate(40).darken(25);
  const muted = seed.desaturate(25).darken(10);

  const onPrimary = textOn(primary, 4.5);
  const text = textOn(bg, 4.5);
  const textOnSurface = textOn(surface, 4.5);

  const bgSafe =
    contrastRatio(text, bg) < 4.5
      ? ensureContrast(bg, text, 4.5, "auto")
      : bg.toHexString().toUpperCase();

  const surfSafe =
    contrastRatio(textOnSurface, surface) < 4.5
      ? ensureContrast(surface, textOnSurface, 4.5, "auto")
      : surface.toHexString().toUpperCase();

  return {
    roles: {
      bg: bgSafe,
      surface: surfSafe,
      text,
      muted: muted.toHexString().toUpperCase(),
      primary: primary.toHexString().toUpperCase(),
      onPrimary,
    },
    swatches: [
      primary.toHexString().toUpperCase(),
      muted.toHexString().toUpperCase(),
      surfSafe,
      textOnSurface,
      bgSafe,
    ],
  };
}

export function buildValueContrast(seedHex, level) {
  const s = tinycolor(seedHex);
  const scales = {
    low: [-8, -4, 0, 4, 8, 12],
    light: [6, 10, 14, 18, 22, 26],
    moderate: [-16, -8, 0, 8, 16, 24],
    medium: [-22, -14, -6, 6, 14, 22],
    high: [-30, -20, -10, 10, 20, 30],
    "dark-value": [-34, -28, -22, -16, -10, -4],
  };
  return (scales[level] ?? scales.moderate).map((v) =>
    s.clone().lighten(v).toHexString().toUpperCase()
  );
}

// --- Itten-like contrast types for Base ---
export function buildContrastByType(seedHex, type = "light-dark") {
  const s = tinycolor(seedHex);

  const toHEX = (arr) =>
    arr.map((c) => tinycolor(c).toHexString().toUpperCase());

  switch (type) {
    case "light-dark": {
      const steps = [-22, -10, -4, 6, 14, 22];
      return toHEX(steps.map((v) => s.clone().lighten(v)));
    }
    case "cold-warm": {
      const h = s.toHsl().h || 0;
      const cold = tinycolor({ h: (h + 200) % 360, s: 0.6, l: 0.55 });
      const warm = tinycolor({ h: (h + 30) % 360, s: 0.7, l: 0.55 });
      return toHEX([
        cold.clone().saturate(10),
        cold.clone().lighten(10),
        cold.clone().desaturate(15),
        warm.clone().desaturate(10),
        warm.clone().lighten(8),
        warm.clone().saturate(10),
      ]);
    }
    case "complementary": {
      const comp = s.clone().complement();
      return toHEX([
        s.clone().saturate(20),
        s.clone().lighten(10),
        s.clone().desaturate(20),
        comp.clone().desaturate(20),
        comp.clone().lighten(10),
        comp.clone().saturate(20),
      ]);
    }
    case "simultaneous": {
      const neutral = s.clone().desaturate(80).lighten(35);
      const comp = s.clone().complement();
      return toHEX([
        neutral.clone().darken(10),
        neutral,
        neutral.clone().lighten(10),
        s.clone().saturate(30),
        comp.clone().saturate(30),
        neutral.clone().lighten(18),
      ]);
    }
    case "saturation": {
      const base = s.clone();
      const l = base.toHsl().l;
      return toHEX(
        [
          base.clone().desaturate(80).setAlpha(1).toHslString(),
          base.clone().desaturate(50).toHslString(),
          base.clone().desaturate(20).toHslString(),
          base.clone().saturate(10).toHslString(),
          base.clone().saturate(30).toHslString(),
          base.clone().saturate(50).toHslString(),
        ].map((c) => tinycolor(c).setAlpha(1).toHexString())
      );
    }
    case "extension": {
      const a = s.clone().saturate(25).lighten(5);
      const b = s.clone().complement().darken(5);
      return toHEX([a, b, b, a, b, b]);
    }
    default:
      return toHEX([-22, -10, -4, 6, 14, 22].map((v) => s.clone().lighten(v)));
  }
}
