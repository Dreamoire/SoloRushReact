import tinycolor from "tinycolor2";

// WCAG контраст 1–21
export function ratio(a, b) {
  return tinycolor.readability(a, b);
}

// подобрать цвет, усиливая светлее/темнее, пока не достигнем нужного контраста
export function ensureContrast(base, against, min = 4.5, prefer = "auto") {
  const start = tinycolor(base);
  const target = tinycolor(against);
  let c = start.clone();
  const darkerFirst =
    prefer === "darker" ||
    (prefer === "auto" &&
      ratio(c, target) < ratio(c.clone().darken(10), target));
  for (let i = 0; i < 20 && ratio(c, target) < min; i += 1) {
    c = darkerFirst ? c.darken(3) : c.lighten(3);
  }
  return c.toHexString().toUpperCase();
}

// оптимальный текст для фона: чёрный или белый или подправленный
export function textOn(bg, min = 4.5) {
  const black = "#000000";
  const white = "#FFFFFF";
  if (ratio(black, bg) >= min) return black;
  if (ratio(white, bg) >= min) return white;
  // если оба не проходят — подвинем ближе к нужному
  return ratio(black, bg) > ratio(white, bg)
    ? ensureContrast(black, bg, min, "darker")
    : ensureContrast(white, bg, min, "lighter");
}
