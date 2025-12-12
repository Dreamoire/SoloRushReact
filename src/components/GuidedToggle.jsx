export default function GuidedToggle({ open, onToggle }) {
	return (
		<button
			type="button"
			className="insp-toggle"
			onClick={onToggle}
			aria-expanded={open}
		>
			{open ? "Masquer les palettes guidées" : "Afficher les palettes guidées"}
		</button>
	);
}
