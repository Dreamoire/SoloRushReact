import { useState } from "react";
import { palettes as STATIC } from "./data/palettes";
import { fetchScheme, MODE_BY_CATEGORY } from "./lib/colorApi";
import { getLocalScheme } from "./lib/localSchemes";
import {
	buildDarkMode,
	buildFuturiste,
	buildCozy,
	buildLuxe,
	buildProfessional,
} from "./lib/categorySchemes";
import ColorPicker from "./components/ColorPicker";
import PaletteCard from "./components/PaletteCard";

export default function App() {
	const [hex, setHex] = useState("#FF6600");
	const [input, setInput] = useState("#FF6600");
	const [dynamic, setDynamic] = useState(null);

	const [copiedId, setCopiedId] = useState(null);

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
			if (p.id === "dark") return { ...p, colors: buildDarkMode(v) };
			if (p.id === "future") return { ...p, colors: buildFuturiste(v) };
			if (p.id === "cozy") return { ...p, colors: buildCozy(v) };
			if (p.id === "luxe") return { ...p, colors: buildLuxe(v) };
			if (p.id === "pro") return { ...p, colors: buildProfessional(v) };

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
	// ...

	return (
		<main>
			<h1>Générateur de palettes</h1>

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

			<section style={{ marginTop: 12 }}>
				<ColorPicker
					value={hex}
					onChange={(v) => {
						setHex(v);
						setInput(v);
					}}
				/>
			</section>

			<section className="grid" style={{ marginTop: 24 }}>
				{source.map((p) => (
					<PaletteCard
						key={p.id}
						palette={p}
						copied={copiedId === p.id}
						onCopy={(colors) => handleCopy(p.id, colors, "hex")}
					/>
				))}
			</section>
		</main>
	);
}
