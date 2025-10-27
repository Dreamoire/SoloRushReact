import { useEffect, useRef } from "react";
import iro from "@jaames/iro";

export default function ColorPicker({ value = "#FF6600", onChange }) {
	const containerRef = useRef(null);
	const pickerRef = useRef(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: picker init only once
	useEffect(() => {
		if (pickerRef.current) return;

		const picker = new iro.ColorPicker(containerRef.current, {
			width: 220,
			color: value,
			layout: [
				{ component: iro.ui.Wheel },
				{ component: iro.ui.Slider, options: { sliderType: "value" } },
			],
		});

		pickerRef.current = picker;

		const handler = (c) => onChange?.(c.hexString.toUpperCase());
		picker.on("color:change", handler);

		return () => {
			picker.off("color:change", handler);
			pickerRef.current = null;
			if (containerRef.current) containerRef.current.innerHTML = "";
		};
	}, []);

	useEffect(() => {
		if (pickerRef.current && value) {
			pickerRef.current.color.hexString = value;
		}
	}, [value]);

	return <div ref={containerRef} />;
}
