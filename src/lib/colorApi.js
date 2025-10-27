export const MODE_BY_CATEGORY = {
  energy: "triad",
  cozy: "analogic",
  minimal: "monochrome-light",
  nature: "analogic",
  future: "quad",
  kiddo: "quad",
  luxe: "complement",
  pro: "monochrome",
  dark: "monochrome-dark",
};

export async function fetchScheme(seedHex, mode, count = 5) {
  const hex = seedHex.replace(/^#/, "");
  const url = `https://www.thecolorapi.com/scheme?hex=${hex}&mode=${mode}&count=${count}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  // json.colors -> [{ hex: { value:"#AABBCC" }, ... }]
  return json.colors.map((c) => c.hex.value.toUpperCase());
}
