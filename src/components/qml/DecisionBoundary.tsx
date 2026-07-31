import { useEffect, useRef } from "react";
import { magmaColor } from "../../lib/viz/magma.ts";
import { predict } from "../../lib/qml/cost.ts";
import type { Dataset } from "../../lib/qml/types.ts";

const GRID = 40;
const CANVAS_SIZE = 360;

interface DecisionBoundaryProps {
  weights: number[];
  layers: number;
  dataset: Dataset;
}

export default function DecisionBoundary({ weights, layers, dataset }: DecisionBoundaryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cell = CANVAS_SIZE / GRID;
    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const x0 = gx / (GRID - 1);
        const x1 = 1 - gy / (GRID - 1);
        const p = predict([x0, x1], weights, layers);
        ctx.fillStyle = magmaColor(p);
        ctx.fillRect(gx * cell, gy * cell, cell + 1, cell + 1);
      }
    }

    for (const point of dataset) {
      const px = point.x[0] * CANVAS_SIZE;
      const py = (1 - point.x[1]) * CANVAS_SIZE;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      if (point.label === 1) {
        ctx.fillStyle = "#8B5CF6"; // accent, filled
        ctx.fill();
        ctx.strokeStyle = "#020617";
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = "#020617";
        ctx.fill();
        ctx.strokeStyle = "#D946EF"; // accent-2, outline only
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [weights, layers, dataset]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="w-full max-w-[420px] rounded-lg border border-border"
    />
  );
}
