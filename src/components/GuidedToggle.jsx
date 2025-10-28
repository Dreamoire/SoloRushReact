export default function GuidedToggle({ open, onToggle }) {
	return (
		<button type="button" className="guidedToggle" onClick={onToggle}>
			{open ? "Hide Palettes Guidées" : "Show Palettes Guidées"}
		</button>
	);
}
