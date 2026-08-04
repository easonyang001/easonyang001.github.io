export type Bit = 0 | 1;
export type Bitstring = Bit[];
export type QuboMatrix = number[][];

export interface QuboTemplate {
  slug: string;
  name: string;
  description: string;
  variables: string[];
  matrix: QuboMatrix;
}

export interface QuboSolution {
  bits: Bitstring;
  energy: number;
  feasible: boolean;
  violations: string[];
}

export const QUBO_TEMPLATES: QuboTemplate[] = [
  {
    slug: "maxcut-triangle",
    name: "Max-Cut triangle",
    description: "Three binary variables choose a graph partition. Lower energy means more cut edges.",
    variables: ["A", "B", "C"],
    matrix: [
      [0, 2, 2],
      [0, 0, 2],
      [0, 0, 0],
    ],
  },
  {
    slug: "portfolio",
    name: "Portfolio selection",
    description: "Select assets with return rewards and pairwise risk penalties.",
    variables: ["AI", "QC", "Cloud", "Energy"],
    matrix: [
      [-5, 2, 1, 3],
      [0, -4, 3, 1],
      [0, 0, -3, 2],
      [0, 0, 0, -6],
    ],
  },
  {
    slug: "coverage",
    name: "Sensor coverage",
    description: "Pick sensors with installation costs and overlap penalties.",
    variables: ["N", "E", "S", "W"],
    matrix: [
      [-4, 3, 1, 2],
      [0, -5, 2, 1],
      [0, 0, -4, 3],
      [0, 0, 0, -3],
    ],
  },
];

export function cloneMatrix(matrix: QuboMatrix): QuboMatrix {
  return matrix.map((row) => [...row]);
}

export function quboEnergy(bits: Bitstring, matrix: QuboMatrix): number {
  let energy = 0;
  for (let i = 0; i < bits.length; i++) {
    for (let j = i; j < bits.length; j++) {
      energy += matrix[i][j] * bits[i] * bits[j];
    }
  }
  return energy;
}

export function formatBitstring(bits: Bitstring): string {
  return bits.join("");
}

export function enumerateBitstrings(size: number): Bitstring[] {
  const count = 2 ** size;
  return Array.from({ length: count }, (_, value) =>
    Array.from({ length: size }, (_bit, index) => ((value >> (size - index - 1)) & 1) as Bit)
  );
}

export function evaluateQubo(
  matrix: QuboMatrix,
  requiredCount: number | null = null
): QuboSolution[] {
  return enumerateBitstrings(matrix.length)
    .map((bits) => {
      const selected = bits.reduce<number>((sum, bit) => sum + bit, 0);
      const violations =
        requiredCount !== null && selected !== requiredCount
          ? [`selected ${selected}, expected ${requiredCount}`]
          : [];
      return {
        bits,
        energy: quboEnergy(bits, matrix),
        feasible: violations.length === 0,
        violations,
      };
    })
    .sort((a, b) => a.energy - b.energy || formatBitstring(a.bits).localeCompare(formatBitstring(b.bits)));
}

export function greedyQubo(matrix: QuboMatrix): QuboSolution {
  const bits: Bitstring = Array.from({ length: matrix.length }, () => 0 as Bit);
  let improved = true;

  while (improved) {
    improved = false;
    let bestBits = bits;
    let bestEnergy = quboEnergy(bits, matrix);

    for (let i = 0; i < bits.length; i++) {
      const candidate = [...bits] as Bitstring;
      candidate[i] = candidate[i] === 1 ? 0 : 1;
      const energy = quboEnergy(candidate, matrix);
      if (energy < bestEnergy) {
        bestBits = candidate;
        bestEnergy = energy;
        improved = true;
      }
    }

    for (let i = 0; i < bits.length; i++) {
      bits[i] = bestBits[i];
    }
  }

  return { bits, energy: quboEnergy(bits, matrix), feasible: true, violations: [] };
}
