export interface AnnealingLandscape {
  slug: string;
  name: string;
  description: string;
  energyAt: (x: number) => number;
}

export interface AnnealingPoint {
  step: number;
  x: number;
  energy: number;
  bestX: number;
  bestEnergy: number;
  temperature: number;
  accepted: boolean;
}

export const ANNEALING_LANDSCAPES: AnnealingLandscape[] = [
  {
    slug: "double-well",
    name: "Double well",
    description: "Two basins with one global minimum and one tempting local minimum.",
    energyAt: (x) => {
      const left = Math.pow((x - 28) / 15, 2) - 2.8;
      const right = Math.pow((x - 76) / 18, 2) - 4.1;
      return Math.min(left, right) + 0.18 * Math.sin(x / 3);
    },
  },
  {
    slug: "rugged",
    name: "Rugged landscape",
    description: "Many shallow traps make the cooling schedule matter.",
    energyAt: (x) =>
      0.0014 * Math.pow(x - 68, 2) +
      0.42 * Math.sin(x / 2.7) +
      0.24 * Math.cos(x / 1.4) -
      3.6,
  },
  {
    slug: "funnel",
    name: "Noisy funnel",
    description: "A broad funnel with small local fluctuations near the optimum.",
    energyAt: (x) => Math.abs(x - 58) / 16 + 0.28 * Math.sin(x / 2.2) - 3.2,
  },
];

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

export function sampleLandscape(
  landscape: AnnealingLandscape,
  size = 101
): { x: number; energy: number }[] {
  return Array.from({ length: size }, (_item, x) => ({ x, energy: landscape.energyAt(x) }));
}

export function runAnnealing({
  landscape,
  initialTemperature,
  coolingRate,
  steps,
  seed,
  startX = 50,
}: {
  landscape: AnnealingLandscape;
  initialTemperature: number;
  coolingRate: number;
  steps: number;
  seed: number;
  startX?: number;
}): AnnealingPoint[] {
  const random = seededRandom(seed);
  let x = Math.max(0, Math.min(100, Math.round(startX)));
  let energy = landscape.energyAt(x);
  let bestX = x;
  let bestEnergy = energy;
  const trace: AnnealingPoint[] = [];

  for (let step = 0; step <= steps; step++) {
    const temperature = Math.max(0.0001, initialTemperature * Math.pow(coolingRate, step));
    const direction = random() < 0.5 ? -1 : 1;
    const jump = random() < 0.12 ? 3 : 1;
    const candidateX = Math.max(0, Math.min(100, x + direction * jump));
    const candidateEnergy = landscape.energyAt(candidateX);
    const delta = candidateEnergy - energy;
    const accepted = delta <= 0 || random() < Math.exp(-delta / temperature);

    if (accepted) {
      x = candidateX;
      energy = candidateEnergy;
      if (energy < bestEnergy) {
        bestX = x;
        bestEnergy = energy;
      }
    }

    trace.push({ step, x, energy, bestX, bestEnergy, temperature, accepted });
  }

  return trace;
}
