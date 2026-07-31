export interface Complex {
  re: number;
  im: number;
}

export interface Qubit1State {
  alpha: Complex;
  beta: Complex;
}

export interface BlochAngles {
  theta: number;
  phi: number;
}

export type GateName = "X" | "Y" | "Z" | "H" | "Rx" | "Ry" | "Rz";
