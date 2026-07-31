/**
 * Perceptually-uniform magma color scale, matching the magma.0-5 stops
 * defined in tailwind.config.js. Kept as plain RGB math (not Tailwind
 * classes) because canvas/SVG per-cell fills need computed color values.
 */
const STOPS: [number, number, number][] = [
  [0, 0, 4], // magma.0 #000004
  [59, 15, 112], // magma.1 #3B0F70
  [140, 41, 129], // magma.2 #8C2981
  [222, 73, 104], // magma.3 #DE4968
  [254, 159, 109], // magma.4 #FE9F6D
  [252, 253, 191], // magma.5 #FCFDBF
];

export function magmaColor(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const scaled = clamped * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(scaled));
  const frac = scaled - i;
  const [r0, g0, b0] = STOPS[i];
  const [r1, g1, b1] = STOPS[i + 1];
  const r = Math.round(r0 + (r1 - r0) * frac);
  const g = Math.round(g0 + (g1 - g0) * frac);
  const b = Math.round(b0 + (b1 - b0) * frac);
  return `rgb(${r}, ${g}, ${b})`;
}

export const MAGMA_CSS_GRADIENT =
  "linear-gradient(to right, #000004, #3B0F70, #8C2981, #DE4968, #FE9F6D, #FCFDBF)";
