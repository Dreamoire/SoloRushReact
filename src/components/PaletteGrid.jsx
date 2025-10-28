import { buildPalette } from "../lib/paletteEngine";

export default function PaletteGrid({ seed, contrast, schemes }) {
	return (
		<section className="grid">
			{schemes.map((s) => (
				<PaletteCard
					key={s.id}
					title={s.label}
					colors={buildPalette(seed, s.id, contrast)}
				/>
			))}
		</section>
	);
}
