export default function PaletteCard({
	palette,
	onCopy = () => {},
	copied = false,
}) {
	const colors = (palette.colors ?? []).slice(0, 6);
	while (colors.length < 6) {
		colors.push(colors[colors.length - 1] ?? "#FFFFFF");
	}

	return (
		<article className="palette-card">
			<header className="palette-card__header">
				<span className="palette-title tooltip-parent">
					{palette.title}
					<span className="tooltip" role="tooltip">
						{palette.description}
					</span>
				</span>

				<div className="actions">
					<button
						type="button"
						className={`btn copy ${copied ? "copied" : ""}`}
						onClick={() => onCopy?.("hex")}
					>
						<span className="copy-text">{copied ? "Copié" : "Copier"}</span>
					</button>
				</div>
			</header>

			<div className="gen-lines">
				{colors.map((c, i) => (
					<div
						key={`${palette.id}-${c}-${i}`}
						className="gen-line"
						style={{ "--sw": c }}
					>
						<span className="gen-line-label">{c}</span>
					</div>
				))}
			</div>
		</article>
	);
}
