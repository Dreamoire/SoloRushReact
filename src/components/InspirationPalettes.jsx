import { useState } from "react";
import { INSPIRATION } from "../data/inspirationPalettes";

export default function InspirationPalettes() {
	const [copiedId, setCopiedId] = useState(null);

	function handleCopy(id, colors) {
		const txt = colors.join(", ");
		navigator.clipboard.writeText(txt).then(() => {
			setCopiedId(id);
			setTimeout(() => setCopiedId(null), 3200);
		});
	}

	return (
		<section className="insp">
			<h2>Quelques palettes d’inspiration</h2>
			<div className="insp-grid">
				{INSPIRATION.map((p) => (
					<article key={p.id} className="insp-card tooltip-parent">
						<header className="insp-header">
							<span className="insp-title">{p.name}</span>
							<button
								type="button"
								className={`btn copy ${copiedId === p.id ? "copied" : ""}`}
								onClick={() => handleCopy(p.id, p.colors)}
							>
								<span className="copy-text">
									{copiedId === p.id ? "Copié" : "Copier"}
								</span>
							</button>
						</header>

						{}
						<span className="tooltip" role="tooltip">
							{p.desc}
						</span>

						<div className="insp-row">
							{p.colors.map((c) => (
								<span key={c} className="sw" style={{ "--c": c }} title={c} />
							))}
						</div>

						<div className="hex-row">{p.colors.join(", ")}</div>
					</article>
				))}
			</div>
		</section>
	);
}
