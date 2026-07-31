import { MAGMA_CSS_GRADIENT } from "../../lib/viz/magma.ts";

interface MagmaLegendProps {
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export default function MagmaLegend({ min = 0, max = 1, label, className = "" }: MagmaLegendProps) {
  return (
    <div className={`w-full max-w-[240px] ${className}`}>
      {label && (
        <p className="mb-2 font-mono text-mono-label uppercase text-text-muted">{label}</p>
      )}
      <div className="h-3 w-full rounded-sm" style={{ background: MAGMA_CSS_GRADIENT }} />
      <div className="mt-1 flex justify-between font-mono text-mono-label text-text-muted">
        <span>{min.toFixed(1)}</span>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
}
