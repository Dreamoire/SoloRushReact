import tinycolor from "tinycolor2";

function normalizeHex(hex) {
	return tinycolor(hex).toHexString().toUpperCase();
}

function ensureSeedInColors(seedHex, colors, index = 1) {
	const seed = normalizeHex(seedHex);
	const normalized = colors.map(normalizeHex);

	if (normalized.includes(seed)) {
		return normalized;
	}

	const copy = [...normalized];

	while (copy.length <= index) {
		copy.push(copy[copy.length - 1] ?? "#FFFFFF");
	}

	copy[index] = seed;
	return copy;
}

const BLACK = "#000000";
const CHARCOAL = "#1A1D22";
const H = (tc) => tinycolor(tc).toHexString().toUpperCase();
const hue = (c) => tinycolor(c).toHsl().h || 0;
const mk = (h, s, l) => tinycolor({ h, s, l });
const mixTo = (seed, target, w = 35) => tinycolor.mix(target, seed, w);
const NB = (hex) => (tinycolor.equals(hex, BLACK) ? "#111111" : hex);
const shiftHue = (tc, deg) =>
	tinycolor({ ...tc.toHsl(), h: (tc.toHsl().h + deg + 360) % 360 });

function isWarm(x) {
	const h = (typeof x === "string" ? tinycolor(x) : x).toHsl().h;
	return h >= 20 && h <= 70;
}

function steelRampFrom(seed) {
	const s = typeof seed === "string" ? tinycolor(seed) : seed;
	const base = tinycolor("#7A869A");
	const mixed = tinycolor.mix(base, s, 45).desaturate(45);

	const seedL = s.toHsl().l;
	const bias = seedL < 0.45 ? 10 : -8;

	const dark = H(mixed.clone().darken(12 + Math.max(0, -bias)));
	const mid = H(mixed.clone().lighten(bias));
	const light = H(mixed.clone().lighten(16 + Math.max(0, bias)));

	return { dark, mid, light };
}

function dedupeExact(arr) {
	const out = [];
	for (const c of arr) {
		if (!out.some((x) => tinycolor.equals(x, c))) out.push(c);
	}
	return out;
}

function addUniqueUntilLen(arr, targetLen, seedHex) {
	const out = [...arr];
	const seed = seedHex ? tinycolor(seedHex) : tinycolor("#777777");

	let step = 8;
	let flip = false;
	let tries = 0;

	while (out.length < targetLen && tries < 60) {
		const baseHex = out[out.length - 1] ?? H(seed);
		const base = tinycolor(baseHex);

		const candidate = flip
			? H(base.clone().lighten(step))
			: H(base.clone().darken(step));

		if (!out.some((x) => tinycolor.equals(x, candidate))) {
			out.push(candidate);
		} else {
			const alt = H(
				seed
					.clone()
					.spin(step * 3)
					.saturate(10)
					.lighten(6),
			);
			if (!out.some((x) => tinycolor.equals(x, alt))) out.push(alt);
		}

		flip = !flip;
		step += 4;
		tries += 1;
	}

	return out;
}

function finalizePalette({ out, seedHex, seedIndex = 1, targetLen = 6 }) {
	let res = out.map(normalizeHex);
	res = ensureSeedInColors(seedHex, res, seedIndex);
	res = dedupeExact(res);
	res = addUniqueUntilLen(res, targetLen, seedHex);
	return res.slice(0, targetLen);
}

export function normalizeGuided(id, seedHex, colors = []) {
	const s = tinycolor(seedHex);
	const h = hue(s);

	let out = [...colors].map((c) => H(c));

	const dropBlack = () => {
		out = out.filter((c) => !tinycolor.equals(c, BLACK));
	};

	switch (id) {
		case "cozy": {
			dropBlack();
			out = [
				H(mixTo(s, mk(h, 0.08, 0.92))),
				"#FFFFFF",
				H(mixTo(s, mk((h + 20) % 360, 0.15, 0.95), 25)),
				H(mixTo(s, mk(30, 0.22, 0.55), 30)),
				(() => {
					const coolDarkG = mk((h + 200) % 360, 0.35, 0.2);
					const darkBrown = mk(26, 0.45, 0.22);
					const weight = h >= 20 && h <= 70 ? 30 : 70;
					return NB(H(tinycolor.mix(darkBrown, coolDarkG, weight)));
				})(),
			];

			return finalizePalette({ out, seedHex, seedIndex: 1 });
		}

		case "energy": {
			dropBlack();

			const warmOrange = H(mk(28, 0.98, 0.55));
			const warmYellow = H(mk(50, 0.98, 0.55));
			const warmNearSeed = H(
				mk((h + 10) % 360, Math.max(0.9, s.toHsl().s), 0.55),
			);
			const seedBright = H(s.clone().saturate(45).lighten(8));
			const deep = NB(H(s.clone().saturate(35).darken(35)));

			out = [warmOrange, warmYellow, warmNearSeed, seedBright, deep];

			return finalizePalette({ out, seedHex, seedIndex: 3 });
		}

		case "future":
		case "futuriste": {
			const steel = steelRampFrom(s);
			const nearBlack = H(mixTo(s, mk(220, 0.18, 0.12), 35));

			out = [
				H(mixTo(s, mk((h + 180) % 360, 0.95, 0.7), 25)),
				H(mixTo(s, mk((h + 170) % 360, 0.95, 0.5))),
				steel.light,
				steel.mid,
				steel.dark,
				nearBlack,
			];

			return finalizePalette({ out, seedHex, seedIndex: 2 });
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

			return finalizePalette({ out, seedHex, seedIndex: 1 });
		}

		case "nature": {
			dropBlack();

			const green = H(mixTo(s, mk(120, 0.78, 0.42), 20));
			out = [
				green,
				NB(H(mixTo(s, mk((h + 30) % 360, 0.45, 0.4), 30))),
				NB(H(mixTo(s, mk((h + 20) % 360, 0.25, 0.78), 30))),
				NB(H(mixTo(s, mk((h + 40) % 360, 0.55, 0.62), 30))),
				NB(H(mixTo(s, mk((h + 210) % 360, 0.45, 0.58), 30))),
			];

			return finalizePalette({ out, seedHex, seedIndex: 1 });
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

			return finalizePalette({ out, seedHex, seedIndex: 1 });
		}

		case "pro":
		case "professional": {
			out = [
				H(mixTo(s, s.clone().saturate(45).darken(5))),
				H(mixTo(s, s.clone().spin(180).saturate(30).lighten(5))),
				H(mixTo(s, s.clone().desaturate(40).lighten(18), 45)),
				H(mixTo(s, s.clone().desaturate(65).lighten(35), 45)),
				"#FFFFFF",
				BLACK,
			];

			return finalizePalette({ out, seedHex, seedIndex: 1 });
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

			return finalizePalette({ out, seedHex, seedIndex: 1 });
		}

		case "dark":
		case "darkmode":
		case "dark-mode": {
			const darkest = CHARCOAL;
			const dark2 = H(mixTo(s, mk(220, 0.18, 0.28), 35));
			const midGrey = H(mixTo(s, mk(220, 0.1, 0.62), 35));
			const lightGrey = H(mixTo(s, mk(220, 0.08, 0.78), 35));
			const neon = H(
				mixTo(s, s.clone().complement().saturate(80).lighten(35), 10),
			);

			out = [darkest, dark2, midGrey, lightGrey, neon];

			return finalizePalette({ out, seedHex, seedIndex: 1 });
		}

		default: {
			return finalizePalette({ out, seedHex, seedIndex: 1 });
		}
	}
}

export function buildDarkMode(seedHex) {
	const seed = tinycolor(seedHex);
	const neighbor = shiftHue(seed, isWarm(seed) ? -20 : 20);
	const darkest = H("#111111");
	const dark = H(seed.clone().darken(35).desaturate(20));
	const accent = H(neighbor.saturate(25).lighten(10));
	const uiGrey = H(seed.clone().desaturate(60).lighten(30));
	return [darkest, dark, accent, uiGrey, H("#F4F6F8")];
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
	const steel = steelRampFrom(s);
	const nearBlack = H(mixTo(s, mk(220, 0.18, 0.12), 35));
	return [neon, cyan, steel.mid, blue, green, nearBlack];
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
	const dark = H("#111111");
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
	const black = H("#111111");
	const deep = H(seed.clone().saturate(25).darken(25));
	const metal = warm ? H(tinycolor("#D4AF37")) : H(tinycolor("#C0C0C0"));
	const cream = warm ? H(tinycolor("#FFF1D6")) : H(tinycolor("#EEF3FF"));
	return [deep, black, metal, cream, H("#F4F6F8")];
}

export function buildProfessional(seedHex) {
	const seed = tinycolor(seedHex);
	const darkGrey = H(seed.clone().desaturate(80).darken(35));
	const midGrey = H(seed.clone().desaturate(70).darken(10));
	const accent = H(seed.clone().desaturate(10).lighten(10));
	return [midGrey, accent, darkGrey, H("#F4F6F8"), "#FFFFFF"];
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
