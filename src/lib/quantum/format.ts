import type { Complex } from "./types.ts";

export const radToDeg = (radians: number): number => (radians * 180) / Math.PI;
export const degToRad = (degrees: number): number => (degrees * Math.PI) / 180;

export const formatProbability = (p: number): string => p.toFixed(4);

export const formatAngleDegrees = (radians: number): string => `${radToDeg(radians).toFixed(1)}°`;

export const formatComplex = (c: Complex): string => {
  const sign = c.im < 0 ? "−" : "+";
  return `${c.re.toFixed(4)} ${sign} ${Math.abs(c.im).toFixed(4)}i`;
};
