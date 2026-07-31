import { formatComplex, formatProbability } from "../../lib/quantum/format.ts";
import type { Complex } from "../../lib/quantum/types.ts";

interface AmplitudeTableProps {
  basisLabels: string[];
  statevector: Complex[];
  probabilities: number[];
}

export default function AmplitudeTable({ basisLabels, statevector, probabilities }: AmplitudeTableProps) {
  return (
    <div className="overflow-x-auto rounded-panel border border-panel-border">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-panel-divider">
            <th className="px-4 py-2 font-mono text-mono-label uppercase text-text-muted">State</th>
            <th className="px-4 py-2 font-mono text-mono-label uppercase text-text-muted">Amplitude</th>
            <th className="px-4 py-2 font-mono text-mono-label uppercase text-text-muted">Probability</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-panel-divider">
          {basisLabels.map((label, i) => (
            <tr key={label}>
              <td className="px-4 py-2 font-mono text-small text-text-primary">|{label}⟩</td>
              <td className="readout px-4 py-2 font-mono text-small text-text-primary">
                {formatComplex(statevector[i])}
              </td>
              <td className="readout px-4 py-2 font-mono text-small text-text-primary">
                {formatProbability(probabilities[i])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
