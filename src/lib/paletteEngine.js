import tinycolor from "tinycolor2";
import { contrastRatio, textOn } from "./contrast";

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

export function buildWebPalette(seedHex) {
	const seed = tinycolor(seedHex);

	const primary = seed.saturate(10);
	const surface = seed.desaturate(40).lighten(30);
	const bg = seed.desaturate(60).lighten(42);
	const muted = seed.desaturate(30).lighten(15);

	const text = textOn(bg, 4.5);
	const textOnSurface = textOn(surface, 4.5);
	const onPrimary = textOn(primary, 4.5);

	const bgSafe =
		contrastRatio(text, bg.toHexString()) < 4.5
			? ensureContrast(bg, text, 4.5, "lighter")
			: bg.toHexString().toUpperCase();

	const surfSafe =
		contrastRatio(textOnSurface, surface.toHexString()) < 4.5
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
		contrastRatio(text, bg.toHexString()) < 4.5
			? ensureContrast(bg, text, 4.5, "auto")
			: bg.toHexString().toUpperCase();

	const surfSafe =
		contrastRatio(textOnSurface, surface.toHexString()) < 4.5
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
		dark: [-34, -28, -22, -16, -10, -4],
	};

	return (scales[level] ?? scales.moderate).map((v) => {
		const tc = s.clone();
		const out = v >= 0 ? tc.lighten(v) : tc.darken(-v);
		return out.toHexString().toUpperCase();
	});
}

export function buildContrastByType(
	seedHex,
	type = "light-dark",
	level = "moderate",
) {
	const base = buildValueContrast(seedHex, level);
	const s = tinycolor(seedHex);

	const shiftHue = (tc, deg) =>
		tinycolor({ ...tc.toHsl(), h: (tc.toHsl().h + deg + 360) % 360 });

	if (type === "light-dark") return base;

	const intensity =
		{
			low: 6,
			light: 10,
			moderate: 18,
			medium: 26,
			high: 36,
			dark: 46,
		}[level] ?? 18;

	const toHEX = (arr) =>
		arr.map((c) => tinycolor(c).toHexString().toUpperCase());

	switch (type) {
		case "cold-warm": {
			return toHEX(
				base.map((c, i) =>
					shiftHue(tinycolor(c), i < 3 ? -intensity : intensity),
				),
			);
		}

		case "complementary": {
			const comp = s.clone().complement();
			return toHEX(
				base.map((c, i) => {
					const mixPct = (i / 5) * intensity;
					return tinycolor.mix(c, comp, mixPct);
				}),
			);
		}

		case "simultaneous": {
			return toHEX(
				base.map((c, i) =>
					shiftHue(tinycolor(c), (i % 2 === 0 ? 1 : -1) * (intensity / 2)),
				),
			);
		}

		case "saturation": {
			return toHEX(
				base.map((c, i) => {
					const tc = tinycolor(c);
					const amt = (i - 2.5) * (intensity / 6);
					return tc.saturate(amt);
				}),
			);
		}

		case "extension": {
			return toHEX(
				base.map((c, i) => {
					const tc = tinycolor(c);
					const weight =
						i < 2 ? intensity * 0.2 : i < 4 ? intensity * 0.6 : intensity * 0.9;
					return tc.darken(weight / 6).saturate(weight / 8);
				}),
			);
		}

		default:
			return base;
	}
}
