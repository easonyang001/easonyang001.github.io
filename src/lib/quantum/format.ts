import type { Complex, Qubit1State } from "./types.ts";

export const radToDeg = (radians: number): number => (radians * 180) / Math.PI;
export const degToRad = (degrees: number): number => (degrees * Math.PI) / 180;

export const formatProbability = (p: number): string => p.toFixed(4);

export const formatAngleDegrees = (radians: number): string => `${radToDeg(radians).toFixed(1)}°`;

export const formatComplex = (c: Complex): string => {
  const sign = c.im < 0 ? "−" : "+";
  return `${c.re.toFixed(4)} ${sign} ${Math.abs(c.im).toFixed(4)}i`;
};

const KET_EPSILON = 1e-4;

const formatKetCoefficient = (c: Complex): string =>
  Math.abs(c.im) > KET_EPSILON ? `(${formatComplex(c)})` : c.re.toFixed(4);

/** e.g. "|ψ⟩ = 0.8000|0⟩ + 0.6000|1⟩", falling back to a parenthesized complex term when a coefficient has a visible phase. */
export const formatKet = ({ alpha, beta }: Qubit1State): string => {
  const alphaText = formatKetCoefficient(alpha);
  if (Math.abs(beta.im) > KET_EPSILON) {
    return `|ψ⟩ = ${alphaText}|0⟩ + (${formatComplex(beta)})|1⟩`;
  }
  const sign = beta.re < 0 ? "−" : "+";
  return `|ψ⟩ = ${alphaText}|0⟩ ${sign} ${Math.abs(beta.re).toFixed(4)}|1⟩`;
};
