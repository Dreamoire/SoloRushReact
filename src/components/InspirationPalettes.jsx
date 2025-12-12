import { useEffect, useState } from "react";

import { INSPIRATION } from "../data/inspirationPalettes";

const BREAKPOINT = 1100;

export default function InspirationPalettes() {
	const [copiedId, setCopiedId] = useState(null);
	const [expanded, setExpanded] = useState(false);
	const [initialCount, setInitialCount] = useState(3);

	useEffect(() => {
		const update = () => {
			setInitialCount(window.innerWidth <= BREAKPOINT ? 2 : 3);
		};

		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	function handleCopy(id, colors) {
		const txt = colors.join(", ");
		navigator.clipboard.writeText(txt).then(() => {
			setCopiedId(id);
			setTimeout(() => setCopiedId(null), 3200);
		});
	}

	const visible = expanded ? INSPIRATION : INSPIRATION.slice(0, initialCount);

	return (
		<section className="insp">
			<header className="insp-section-header">
				<h2 className="insp-section-title">Quelques palettes d’inspiration</h2>
			</header>

			<div className="insp-grid">
				{visible.map((p) => (
					<article
						key={p.id}
						className="insp-card tooltip-parent"
						style={{
							"--insp-soft": p.soft,
							"--insp-accent": p.accent,
						}}
					>
						<header className="insp-header">
							<span className="insp-title">{p.name}</span>

							<button
								type="button"
								className={`insp-copy ${copiedId === p.id ? "copied" : ""}`}
								onClick={() => handleCopy(p.id, p.colors)}
							>
								<span className="copy-text">
									{copiedId === p.id ? "Copié" : "Copier"}
								</span>
							</button>
						</header>

						<span className="tooltip" role="tooltip">
							{p.desc}
						</span>

						<div className="insp-lines">
							{p.colors.map((c, i) => (
								<div
									key={`${p.id}-${c}-${i}`}
									className="insp-line"
									style={{ "--sw": c }}
								>
									<span className="insp-line-label">{c}</span>
								</div>
							))}
						</div>
					</article>
				))}

				{!expanded && INSPIRATION.length > initialCount && (
					<button
						type="button"
						className="insp-toggle"
						onClick={() => setExpanded(true)}
					>
						Afficher tout
					</button>
				)}
			</div>

			{expanded && (
				<button
					type="button"
					className="insp-toggle"
					onClick={() => setExpanded(false)}
				>
					Masquer
				</button>
			)}
		</section>
	);
}
