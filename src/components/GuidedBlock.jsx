import { INSPIRATION } from "../data/inspirationPalettes";

export default function GuidedBlock({ open }) {
	return (
		<section className={`guided ${open ? "open" : ""}`}>
			{INSPIRATION.map((p) => (
				<article key={p.id} className="card">
					<header>{p.name}</header>
					<div className="swatches">
						{p.colors.map((c, i) => (
							<span key={c} className="sw" style={{ "--c": c }} />
						))}
					</div>
				</article>
			))}
		</section>
	);
}
