import { CONTRASTS } from "../data/palettesBase";

export default function BaseControls({ seed, onSeed, contrast, onContrast }) {
	return (
		<aside className="controls">
			<label>
				Seed color
				<input
					type="color"
					value={seed}
					onChange={(e) => onSeed(e.target.value)}
				/>
			</label>
			<label>
				Contrast type
				<select value={contrast} onChange={(e) => onContrast(e.target.value)}>
					{CONTRASTS.filter((c) => c !== "hue").unshift && null}
					{CONTRASTS.map((c) => (
						<option key={c} value={c}>
							{c}
						</option>
					))}
				</select>
			</label>
			<small>
				<code>hue</code>.
			</small>
		</aside>
	);
}
