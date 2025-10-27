export default function PaletteCard({
	palette,
	liked = false,
	onToggleLike = () => {},
	onCopy = () => {},
	copied = false, // <<< добавить
}) {
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
						onClick={() => onCopy(palette.colors)}
					>
						<span className="copy-text">{copied ? "Copié" : "Copier"}</span>
					</button>
				</div>
			</header>

			<div className="colors">
				{palette.colors.map((c) => (
					<div key={c} className="color-block" style={{ backgroundColor: c }} />
				))}
			</div>

			<div className="hex-row">{palette.colors.join(", ")}</div>
		</article>
	);
}
