import tinycolor from "tinycolor2";
import { ensureContrast, textOn, ratio } from "./contrast";

// style: "minimal" | "dark" | "energy" ... можно подстраивать позже
export function buildWebPalette(seedHex, style = "default") {
  const seed = tinycolor(seedHex);

  // 1) Тональная база вокруг seed
  const primary = seed.saturate(10); // самый насыщенный
  const surface = seed.desaturate(40).lighten(30); // карточки
  const bg = seed.desaturate(60).lighten(42); // общий фон
  const muted = seed.desaturate(30).lighten(15); // вторичный

  // 2) Гарантируем читаемость
  const text = textOn(bg, 4.5);
  const textOnSurface = textOn(surface, 4.5);
  const onPrimary = textOn(primary, 4.5);

  // подстраховка: если фон слишком тёмный/светлый — двинем его к центру
  const bgSafe =
    ratio(text, bg) < 4.5
      ? tinycolor(ensureContrast(bg, text, 4.5, "lighter")).toHexString()
      : bg.toHexString();
  const surfSafe =
    ratio(textOnSurface, surface) < 4.5
      ? tinycolor(
          ensureContrast(surface, textOnSurface, 4.5, "lighter")
        ).toHexString()
      : surface.toHexString();

  // 3) Выход: 5 свотчей для твоей карточки + роли
  return {
    roles: {
      bg: bgSafe.toUpperCase(),
      surface: surfSafe.toUpperCase(),
      text: text,
      muted: muted.toHexString().toUpperCase(),
      primary: primary.toHexString().toUpperCase(),
      onPrimary,
    },
    // массив из пяти цветов под текущий UI-вид
    swatches: [
      primary.toHexString().toUpperCase(), // 1 — Primary (самый яркий)
      muted.toHexString().toUpperCase(), // 2 — Muted/Accent
      surfSafe.toUpperCase(), // 3 — Surface
      textOnSurface, // 4 — Text on surface
      bgSafe.toUpperCase(), // 5 — Background
    ],
  };
}

// вариант для «dark mode»
export function buildDarkPalette(seedHex) {
  const seed = tinycolor(seedHex);

  const primary = seed.saturate(15);
  const bg = seed.desaturate(60).darken(40);
  const surface = seed.desaturate(40).darken(25);
  const muted = seed.desaturate(25).darken(10);

  const onPrimary = textOn(primary, 4.5);
  const text = textOn(bg, 4.5);
  const textOnSurface = textOn(surface, 4.5);

  // «страховка» контраста как в светлой версии
  const bgSafe =
    ratio(text, bg.toHexString()) < 4.5
      ? ensureContrast(bg, text, 4.5, "auto")
      : bg.toHexString().toUpperCase();

  const surfSafe =
    ratio(textOnSurface, surface.toHexString()) < 4.5
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
