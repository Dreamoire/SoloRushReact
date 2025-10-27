import tinycolor from "tinycolor2";

const H = (c) => tinycolor(c).toHexString().toUpperCase();

export function analogic(seed, count = 5, angle = 30) {
  return tinycolor(seed).analogous(count, angle).map(H).slice(0, count);
}

export function triad(seed, count = 5) {
  const [a, b, c] = tinycolor(seed).triad();
  const extra = [
    tinycolor(seed).lighten(28),
    tinycolor(seed).darken(22),
    tinycolor(seed).saturate(20),
  ].map(H);
  return [H(a), H(b), H(c), ...extra].slice(0, count);
}

export function complement(seed, count = 5) {
  const base = tinycolor(seed);
  const comp = base.complement();
  const extra = [base.lighten(30), base.darken(18), comp.lighten(18)].map(H);
  return [H(base), H(comp), ...extra].slice(0, count);
}

export function quad(seed, count = 5) {
  // tetrad
  const arr = tinycolor(seed).tetrad().map(H);
  const extra = H(tinycolor(seed).lighten(24));
  return [...arr, extra].slice(0, count);
}

export function monochromeLight(seed, count = 5) {
  // светлая шкала для фонов/поверхностей
  const base = tinycolor(seed).desaturate(40);
  const steps = [46, 38, 30, 22, 14]; // чем выше — светлее
  return steps.slice(0, count).map((n) => H(base.lighten(n)));
}

export function monochromeDark(seed, count = 5) {
  // тёмная шкала для dark mode
  const base = tinycolor(seed).desaturate(30);
  const steps = [40, 28, 20, 12, 6]; // чем выше — темнее
  return steps.slice(0, count).map((n) => H(base.darken(n)));
}

export function getLocalScheme(seed, mode, count = 5) {
  switch (mode) {
    case "analogic":
      return analogic(seed, count);
    case "triad":
      return triad(seed, count);
    case "complement":
      return complement(seed, count);
    case "quad":
      return quad(seed, count);
    case "monochrome-light":
      return monochromeLight(seed, count);
    case "monochrome-dark":
      return monochromeDark(seed, count);
    case "monochrome":
      return tinycolor(seed).monochromatic(count).map(H).slice(0, count);
    default:
      return analogic(seed, count);
  }
}
