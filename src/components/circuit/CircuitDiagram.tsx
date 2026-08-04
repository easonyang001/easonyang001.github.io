import { CATEGORY_COLORS, gateCategory } from "../../lib/quantum/gates.ts";
import { NUM_COLUMNS, type Circuit } from "../../lib/quantum/circuit.ts";

const WIRE_COLOR = "#1E293B";
const LABEL_COLOR = "#64748B";
const PENDING_COLOR = "#8B5CF6";

const CELL_W = 56;
const ROW_H = 56;
const LABEL_W = 48;
const GATE_SIZE = 36;

interface CircuitDiagramProps {
  circuit: Circuit;
  pendingControl: { column: number; qubit: number } | null;
  onCellClick: (column: number, qubit: number) => void;
  onGateClick: (id: string) => void;
}

export default function CircuitDiagram({
  circuit,
  pendingControl,
  onCellClick,
  onGateClick,
}: CircuitDiagramProps) {
  const width = LABEL_W + NUM_COLUMNS * CELL_W;
  const height = circuit.numQubits * ROW_H;

  const cx = (column: number) => LABEL_W + column * CELL_W + CELL_W / 2;
  const cy = (qubit: number) => qubit * ROW_H + ROW_H / 2;

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} role="img" aria-label="Quantum circuit diagram">
        {Array.from({ length: circuit.numQubits }, (_, q) => (
          <g key={q}>
            <text
              x={LABEL_W - 12}
              y={cy(q) + 4}
              textAnchor="end"
              className="fill-text-muted font-mono"
              fontSize="11"
              fill={LABEL_COLOR}
            >
              q{q}
            </text>
            <line x1={LABEL_W} y1={cy(q)} x2={width} y2={cy(q)} stroke={WIRE_COLOR} strokeWidth="1" />
          </g>
        ))}

        {Array.from({ length: NUM_COLUMNS }, (_, col) =>
          Array.from({ length: circuit.numQubits }, (_, q) => (
            <rect
              key={`${col}-${q}`}
              x={LABEL_W + col * CELL_W}
              y={q * ROW_H}
              width={CELL_W}
              height={ROW_H}
              fill="transparent"
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`Place selected gate on qubit ${q}, column ${col + 1}`}
              onClick={() => onCellClick(col, q)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onCellClick(col, q);
              }}
            />
          ))
        )}

        {pendingControl && (
          <circle
            cx={cx(pendingControl.column)}
            cy={cy(pendingControl.qubit)}
            r="6"
            fill="none"
            stroke={PENDING_COLOR}
            strokeWidth="1.5"
            strokeDasharray="3 2"
            pointerEvents="none"
          />
        )}

        {circuit.gates.map((gate) => {
          const colors = CATEGORY_COLORS[gateCategory(gate.name)];
          const x = cx(gate.column);
          const y = cy(gate.qubit);

          if (gate.name === "CNOT" && gate.control !== undefined) {
            const controlY = cy(gate.control);
            return (
              <g key={gate.id} className="cursor-pointer" role="button" tabIndex={0} aria-label={`Remove CNOT in column ${gate.column + 1}`} onClick={() => onGateClick(gate.id)} onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onGateClick(gate.id);
              }}>
                <line x1={x} y1={controlY} x2={x} y2={y} stroke={colors.fill} strokeWidth="1.5" />
                <circle cx={x} cy={controlY} r="5" fill={colors.fill} />
                <circle cx={x} cy={y} r="10" fill="none" stroke={colors.fill} strokeWidth="1.5" />
                <line x1={x - 10} y1={y} x2={x + 10} y2={y} stroke={colors.fill} strokeWidth="1.5" />
                <line x1={x} y1={y - 10} x2={x} y2={y + 10} stroke={colors.fill} strokeWidth="1.5" />
              </g>
            );
          }

          return (
            <g key={gate.id} className="cursor-pointer" role="button" tabIndex={0} aria-label={`Remove ${gate.name} from qubit ${gate.qubit}, column ${gate.column + 1}`} onClick={() => onGateClick(gate.id)} onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onGateClick(gate.id);
            }}>
              <rect
                x={x - GATE_SIZE / 2}
                y={y - GATE_SIZE / 2}
                width={GATE_SIZE}
                height={GATE_SIZE}
                rx="4"
                fill={colors.fill}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize="12"
                fontWeight="500"
                fill={colors.text}
                className="font-mono"
              >
                {gate.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
