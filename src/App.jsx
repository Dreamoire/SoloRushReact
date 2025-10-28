import { useState, useEffect } from "react";
import { palettes as STATIC } from "./data/palettes";
import { fetchScheme, MODE_BY_CATEGORY } from "./lib/colorApi";
import { getLocalScheme } from "./lib/localSchemes";
import { buildValueContrast, buildContrastByType } from "./lib/paletteEngine";
import {
	buildDarkMode,
	buildFuturiste,
	buildCozy,
	buildLuxe,
	buildProfessional,
	buildMinimalist,
	buildEnergy,
	buildKiddo,
	normalizeGuided,
} from "./lib/categorySchemes";
import ColorPicker from "./components/ColorPicker";
import PaletteCard from "./components/PaletteCard";
import InspirationPalettes from "./components/InspirationPalettes";

export default function App() {
	const [hex, setHex] = useState("#FF6600");
	const [input, setInput] = useState("#FF6600");
	const [dynamic, setDynamic] = useState(null);
	const [copiedId, setCopiedId] = useState(null);
	const [showMods, setShowMods] = useState(false);
	const [contrastType, setContrastType] = useState("light-dark");
	/* biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount */
	useEffect(() => {
		onOk();
	}, []);

	const BASE_IDS = ["low", "light", "moderate", "medium", "high", "dark-value"];

	const MOD_IDS = [
		"pro",
		"dark",
		"minimal",
		"cozy",
		"future",
		"energy",
		"nature",
		"luxe",
		"kiddo",
	];

	// --- copier ---
	function handleCopy(paletteId, colors, format = "hex") {
		let txt = "";
		if (format === "hex") txt = colors.join(", ");
		else if (format === "json") txt = JSON.stringify(colors);
		else if (format === "css") {
			txt = `:root{\n${colors.map((c, i) => `  --c${i + 1}: ${c};`).join("\n")}\n}`;
		}
		navigator.clipboard.writeText(txt).then(() => {
			setCopiedId(paletteId);
			setTimeout(() => setCopiedId(null), 3200);
		});
	}

	const normHex = (s) => {
		const x = s.trim().replace(/^#?/, "").toUpperCase();
		return /^[0-9A-F]{6}$/.test(x) ? `#${x}` : null;
	};

	async function onOk() {
		const v = normHex(input);
		if (!v) return alert("HEX invalide. Exemple: #1A2B3C");
		setHex(v);

		const tasks = STATIC.map(async (p) => {
			if (BASE_IDS.includes(p.id)) {
				const strength = p.id === "dark-value" ? "dark" : p.id;
				return { ...p, colors: buildContrastByType(v, contrastType, strength) };
			}
			if (p.id === "dark")
				return { ...p, colors: normalizeGuided("dark", v, buildDarkMode(v)) };
			if (p.id === "minimal")
				return {
					...p,
					colors: normalizeGuided("minimalist", v, buildMinimalist(v)),
				};
			if (p.id === "cozy")
				return { ...p, colors: normalizeGuided("cozy", v, buildCozy(v)) };
			if (p.id === "future")
				return {
					...p,
					colors: normalizeGuided("futuriste", v, buildFuturiste(v)),
				};
			if (p.id === "energy")
				return { ...p, colors: normalizeGuided("energy", v, buildEnergy(v)) };
			if (p.id === "pro")
				return {
					...p,
					colors: normalizeGuided("professional", v, buildProfessional(v)),
				};
			if (p.id === "luxe")
				return { ...p, colors: normalizeGuided("luxe", v, buildLuxe(v)) };
			if (p.id === "kiddo")
				return { ...p, colors: normalizeGuided("enfantin", v, buildKiddo(v)) };
			if (p.id === "nature")
				return { ...p, colors: normalizeGuided("nature", v) };

			const mode = MODE_BY_CATEGORY[p.id] ?? "analogic";
			try {
				const colors = await fetchScheme(v, mode, 5);
				return { ...p, colors };
			} catch {
				const colors = getLocalScheme(v, mode, 5);
				return { ...p, colors };
			}
		});

		setDynamic(await Promise.all(tasks));
	}

	const source = dynamic ?? STATIC;

	return (
		<main>
			<h1>Chromosphère : Générateur de palettes</h1>
			<InspirationPalettes />
			<h2>Génération de palettes à partir d’une couleur de base</h2>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onOk();
				}}
				style={{ display: "flex", gap: 8, alignItems: "center" }}
			></form>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					onOk();
				}}
				style={{ display: "flex", gap: 8, alignItems: "center" }}
			>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="#FF6600"
				/>
				<select
					value={contrastType}
					onChange={(e) => setContrastType(e.target.value)}
				>
					<option value="light-dark">Light-dark contrast</option>
					<option value="cold-warm">Cold-warm contrast</option>
					<option value="complementary">Complementary contrast</option>
					<option value="simultaneous">Simultaneous contrast</option>
					<option value="saturation">Contrast of saturation</option>
					<option value="extension">Contrast of extension</option>
				</select>

				<button type="submit">OK</button>
				<div
					style={{
						width: 24,
						height: 24,
						border: "1px solid #ccc",
						background: hex,
					}}
				/>
			</form>

			<section className="colorpicker-section">
				<ColorPicker
					value={hex}
					onChange={(v) => {
						setHex(v);
						setInput(v);
					}}
				/>
			</section>

			<div style={{ display: "flex", gap: 8, marginTop: 24 }}>
				<button
					type="button"
					className="btn"
					onClick={() => setShowMods(!showMods)}
				>
					{showMods
						? "Masquer les palettes guidées"
						: "Afficher les palettes guidées"}
				</button>
			</div>

			<section className="grid" style={{ marginTop: 24 }}>
				{source
					.filter((p) => BASE_IDS.includes(p.id))
					.map((p) => (
						<PaletteCard
							key={p.id}
							palette={p}
							onCopy={(fmt = "hex") => handleCopy(p.id, p.colors, fmt)}
							copied={copiedId === p.id}
						/>
					))}
			</section>

			{showMods && (
				<section className="grid" style={{ marginTop: 24 }}>
					{source

						.filter((p) => MOD_IDS.includes(p.id))
						.map((p) => (
							<PaletteCard
								key={p.id}
								palette={p}
								onCopy={(fmt = "hex") => handleCopy(p.id, p.colors, fmt)}
								copied={copiedId === p.id}
							/>
						))}
				</section>
			)}
		</main>
	);
}
