import * as C from "./complex.ts";
import type { Complex, Qubit1State, BlochAngles, GateName } from "./types.ts";

const EPS = 1e-9;
const SQRT1_2 = Math.SQRT1_2;

/** |psi> = cos(theta/2)|0> + e^(i*phi) sin(theta/2)|1> */
export function anglesToState({ theta, phi }: BlochAngles): Qubit1State {
  const alpha: Complex = { re: Math.cos(theta / 2), im: 0 };
  const beta: Complex = C.scale(C.expI(phi), Math.sin(theta / 2));
  return { alpha, beta };
}

/** Rotates the global phase so alpha is real and non-negative. */
export function normalizeGlobalPhase(state: Qubit1State): Qubit1State {
  const alphaMag = C.magnitude(state.alpha);
  const refPhase = alphaMag > EPS ? C.phase(state.alpha) : C.phase(state.beta);
  const correction = C.expI(-refPhase);
  return {
    alpha: C.mul(state.alpha, correction),
    beta: C.mul(state.beta, correction),
  };
}

export function stateToAngles(state: Qubit1State): BlochAngles {
  const normalized = normalizeGlobalPhase(state);
  const alphaMag = Math.min(1, Math.max(0, C.magnitude(normalized.alpha)));
  const theta = 2 * Math.acos(alphaMag);

  let phi = 0;
  if (Math.sin(theta / 2) > EPS) {
    phi = C.phase(normalized.beta);
    if (phi < 0) phi += 2 * Math.PI;
  }
  return { theta, phi };
}

export function probabilityFromState(state: Qubit1State): { p0: number; p1: number } {
  return { p0: C.magnitudeSquared(state.alpha), p1: C.magnitudeSquared(state.beta) };
}

function gateMatrix(gate: GateName, param: number): [[Complex, Complex], [Complex, Complex]] {
  switch (gate) {
    case "X":
      return [
        [C.ZERO, C.ONE],
        [C.ONE, C.ZERO],
      ];
    case "Y":
      return [
        [C.ZERO, { re: 0, im: -1 }],
        [{ re: 0, im: 1 }, C.ZERO],
      ];
    case "Z":
      return [
        [C.ONE, C.ZERO],
        [C.ZERO, { re: -1, im: 0 }],
      ];
    case "H":
      return [
        [{ re: SQRT1_2, im: 0 }, { re: SQRT1_2, im: 0 }],
        [{ re: SQRT1_2, im: 0 }, { re: -SQRT1_2, im: 0 }],
      ];
    case "Rx": {
      const c: Complex = { re: Math.cos(param / 2), im: 0 };
      const s: Complex = { re: 0, im: -Math.sin(param / 2) };
      return [
        [c, s],
        [s, c],
      ];
    }
    case "Ry": {
      const c: Complex = { re: Math.cos(param / 2), im: 0 };
      const s = Math.sin(param / 2);
      return [
        [c, { re: -s, im: 0 }],
        [{ re: s, im: 0 }, c],
      ];
    }
    case "Rz":
      return [
        [C.expI(-param / 2), C.ZERO],
        [C.ZERO, C.expI(param / 2)],
      ];
  }
}

export function applySingleQubitGate(state: Qubit1State, gate: GateName, param = 0): Qubit1State {
  const m = gateMatrix(gate, param);
  const alpha = C.add(C.mul(m[0][0], state.alpha), C.mul(m[0][1], state.beta));
  const beta = C.add(C.mul(m[1][0], state.alpha), C.mul(m[1][1], state.beta));
  return { alpha, beta };
}
