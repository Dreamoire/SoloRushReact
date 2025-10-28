export default function PaletteCard({
	palette,
	liked = false,
	onToggleLike = () => {},
	onCopy = () => {},
	copied = false,
}) {
	const colors = (palette.colors ?? []).slice(0, 6);
	while (colors.length < 6) {
		colors.push(colors[colors.length - 1] ?? "#FFFFFF");
	}

	return (
		<article className="palette-card">
			<header>
				<span className="palette-title tooltip-parent">
					{palette.title}
					<span className="tooltip" role="tooltip">
						{palette.description}
					</span>
				</span>
				<div className="actions">
					<button
						type="button"
						className={`btn like ${liked ? "active" : ""}`}
						onClick={() => onToggleLike(palette.id)}
					>
						❤️
					</button>
					<button
						type="button"
						className={`btn copy ${copied ? "copied" : ""}`}
						onClick={() => onCopy?.("hex")}
					>
						<span className="copy-text">{copied ? "Copié" : "Copier"}</span>
					</button>
				</div>
			</header>

			<div className="colors">
				{colors.map((c, i) => (
					<div
						key={`${palette.id}-${i}`}
						className="color-block"
						style={{ backgroundColor: c }}
					/>
				))}
			</div>

			<div className="hex-row">{colors.join(", ")}</div>
		</article>
	);
}
