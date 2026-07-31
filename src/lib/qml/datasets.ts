import { seededRandom } from "./train.ts";
import type { Dataset } from "./types.ts";

const N = 40;

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export function twoMoonsDataset(seed = 1): Dataset {
  const rand = seededRandom(seed);
  const points: Dataset = [];
  for (let i = 0; i < N; i++) {
    const label: 0 | 1 = i < N / 2 ? 0 : 1;
    const angle = rand() * Math.PI;
    const noise = () => (rand() - 0.5) * 0.08;
    let px: number;
    let py: number;
    if (label === 0) {
      px = Math.cos(angle);
      py = Math.sin(angle);
    } else {
      px = 1 - Math.cos(angle);
      py = 1 - Math.sin(angle) - 0.5;
    }
    px += noise();
    py += noise();
    const x = clamp01((px + 0.2) / 1.4);
    const y = clamp01((py + 0.7) / 1.7);
    points.push({ x: [x, y], label });
  }
  return points;
}

export function concentricCirclesDataset(seed = 2): Dataset {
  const rand = seededRandom(seed);
  const points: Dataset = [];
  for (let i = 0; i < N; i++) {
    const label: 0 | 1 = i % 2 === 0 ? 0 : 1;
    const angle = rand() * 2 * Math.PI;
    const radius = label === 0 ? 0.15 + rand() * 0.08 : 0.35 + rand() * 0.08;
    const x = clamp01(0.5 + radius * Math.cos(angle));
    const y = clamp01(0.5 + radius * Math.sin(angle));
    points.push({ x: [x, y], label });
  }
  return points;
}

export function linearlySeparableDataset(seed = 3): Dataset {
  const rand = seededRandom(seed);
  const points: Dataset = [];
  let guard = 0;
  while (points.length < N && guard < N * 50) {
    guard += 1;
    const x = rand();
    const y = rand();
    const margin = x + y - 1;
    if (Math.abs(margin) < 0.05) continue;
    const label: 0 | 1 = margin > 0 ? 1 : 0;
    points.push({ x: [x, y], label });
  }
  return points;
}

export interface DatasetInfo {
  slug: string;
  name: string;
  generate: (seed?: number) => Dataset;
}

export const DATASETS: DatasetInfo[] = [
  { slug: "moons", name: "Two Moons", generate: twoMoonsDataset },
  { slug: "circles", name: "Concentric Circles", generate: concentricCirclesDataset },
  { slug: "linear", name: "Linear", generate: linearlySeparableDataset },
];
