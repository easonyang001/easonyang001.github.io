import type { Complex } from "./types.ts";

export const ZERO: Complex = { re: 0, im: 0 };
export const ONE: Complex = { re: 1, im: 0 };

export const add = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });

export const mul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});

export const scale = (a: Complex, k: number): Complex => ({ re: a.re * k, im: a.im * k });

export const magnitude = (a: Complex): number => Math.sqrt(a.re * a.re + a.im * a.im);

export const magnitudeSquared = (a: Complex): number => a.re * a.re + a.im * a.im;

export const phase = (a: Complex): number => Math.atan2(a.im, a.re);

export const expI = (theta: number): Complex => ({ re: Math.cos(theta), im: Math.sin(theta) });
