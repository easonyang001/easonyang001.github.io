import { useMemo, useState } from "react";
import LabNarrative, { VQE_NARRATIVE } from "../../components/LabNarrative.tsx";
import ToolPageLayout from "../../components/ToolPageLayout.tsx";
import EnergyThetaChart from "../../components/chemistry/EnergyThetaChart.tsx";
import PesChart from "../../components/chemistry/PesChart.tsx";
import { h2Hamiltonian, H2_EQUILIBRIUM_BOND_LENGTH_ANGSTROM } from "../../lib/chemistry/h2data.ts";
import { exactDiagonalize } from "../../lib/chemistry/exact.ts";
import { analyticEnergyAndGradient, optimizeVQE, scanEnergyCurve } from "../../lib/chemistry/vqe.ts";

const PES_STEPS = 44;

export default function VQEH2Page() {
  const [bondLength, setBondLength] = useState(H2_EQUILIBRIUM_BOND_LENGTH_ANGSTROM);
  const [theta, setTheta] = useState(0.1);
  const [bestEnergy, setBestEnergy] = useState<number | null>(null);
  const [optimizationHistory, setOptimizationHistory] = useState<number[]>([]);

  const hamiltonian = useMemo(() => h2Hamiltonian(bondLength), [bondLength]);
  const exact = useMemo(() => exactDiagonalize(hamiltonian), [hamiltonian]);
  const currentEnergy = useMemo(
    () => analyticEnergyAndGradient(hamiltonian, theta).energy,
    [hamiltonian, theta]
  );
  const thetaCurve = useMemo(() => scanEnergyCurve(hamiltonian, 200), [hamiltonian]);

  const pesPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= PES_STEPS; i++) {
      const r = 0.3 + (i / PES_STEPS) * (2.5 - 0.3);
      const h = h2Hamiltonian(r);
      const vqe = optimizeVQE(h, 0.1, 0.3, 150);
      const ex = exactDiagonalize(h);
      points.push({ r, vqeEnergy: vqe.energy, exactEnergy: ex.groundEnergy });
    }
    return points;
  }, []);

  const displayedBest = bestEnergy ?? currentEnergy;
  const error = Math.abs(displayedBest - exact.groundEnergy);
  const narrativeCtx = { bondLength, theta, currentEnergy: displayedBest, error, optimized: bestEnergy !== null };

  const handleOptimize = () => {
    const result = optimizeVQE(hamiltonian, theta, 0.3, 300);
    setTheta(((result.theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
    setBestEnergy(result.energy);
    setOptimizationHistory(result.history);
  };

  const handleBondLengthChange = (r: number) => {
    setBondLength(r);
    setBestEnergy(null);
    setOptimizationHistory([]);
  };

  return (
    <ToolPageLayout
      title="H₂ Ground State (VQE)"
      path="/lab/vqe-h2"
      seoDescription="Educational demonstration of the Variational Quantum Eigensolver on a minimal H2 Hamiltonian."
      description={
        <>
          <p className="mt-3 font-mono text-mono-label uppercase text-text-muted">
            Educational demonstration. Hamiltonian coefficients are precomputed and tabulated, not
            calculated in-browser. Limited to H₂ in a minimal basis with a two-qubit reduction.
          </p>
          <p className="mt-3 text-small text-text-secondary">
            These coefficients are a self-constructed approximate model, not reproduced from a
            published ab initio table — no verified source was available in this environment.
            They are calibrated so the exact ground-state energy matches the standard H₂/STO-3G
            equilibrium value of about −1.137 Hartree near R = 0.735 Å, a widely-established
            reference point in quantum chemistry, not a citation to a specific paper.
          </p>
        </>
      }
      panel={
        <>
          <div data-lab-control="bond-length">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-mono-label uppercase text-text-muted">
                Bond Length R
              </label>
              <span className="readout font-mono text-small text-text-primary">
                {bondLength.toFixed(2)} Å
              </span>
            </div>
            <input
              type="range"
              min={0.3}
              max={2.5}
              step={0.01}
              value={bondLength}
              onChange={(e) => handleBondLengthChange(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="mt-6" data-lab-control="theta">
            <div className="mb-2 flex items-center justify-between">
              <label className="font-mono text-mono-label uppercase text-text-muted">Theta</label>
              <span className="readout font-mono text-small text-text-primary">
                {theta.toFixed(3)} rad
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2 * Math.PI}
              step={0.001}
              value={theta}
              onChange={(e) => setTheta(Number(e.target.value))}
              className="slider"
            />
          </div>

          <button
            data-lab-control="optimize"
            onClick={handleOptimize}
            className="mt-6 w-full rounded-md bg-accent px-3 py-2 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover"
          >
            Optimize
          </button>

          <div className="mt-6 rounded-panel border border-panel-border divide-y divide-panel-divider">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">E(θ)</span>
              <span className="readout font-mono text-small text-text-primary">
                {currentEnergy.toFixed(6)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Min E</span>
              <span className="readout font-mono text-small text-text-primary">
                {displayedBest.toFixed(6)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Exact</span>
              <span className="readout font-mono text-small text-text-primary">
                {exact.groundEnergy.toFixed(6)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-mono-label uppercase text-text-muted">Error</span>
              <span className="readout font-mono text-small text-text-primary">
                {error.toFixed(6)}
              </span>
            </div>
          </div>
        </>
      }
    >
      <LabNarrative config={VQE_NARRATIVE} ctx={narrativeCtx}>
        <section className="mb-10" data-lab-visual="molecule-geometry">
          <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">Molecular geometry</p>
          <svg viewBox="0 0 720 180" role="img" aria-label={`Hydrogen atoms separated by ${bondLength.toFixed(2)} angstrom.`} className="w-full rounded-md border border-border bg-readout-bg">
            <line x1={360 - bondLength * 70} y1="90" x2={360 + bondLength * 70} y2="90" stroke="#64748B" strokeWidth="3" />
            <circle cx={360 - bondLength * 70} cy="90" r="24" fill="#8B5CF6" />
            <circle cx={360 + bondLength * 70} cy="90" r="24" fill="#D946EF" />
            <text x={360 - bondLength * 70} y="96" textAnchor="middle" fill="#F8FAFC" fontSize="16">H</text>
            <text x={360 + bondLength * 70} y="96" textAnchor="middle" fill="#F8FAFC" fontSize="16">H</text>
            <text x="360" y="145" textAnchor="middle" fill="#94A3B8" fontSize="13">R = {bondLength.toFixed(2)} angstrom</text>
          </svg>
        </section>
        <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">E(θ) Curve</p>
        <div data-lab-visual="energy-theta">
          <EnergyThetaChart points={thetaCurve} currentTheta={theta} currentEnergy={currentEnergy} />
        </div>

        <div className="mt-10" data-lab-visual="pes">
          <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">
            Potential Energy Surface — VQE (accent) vs. exact (dashed)
          </p>
          <PesChart
            points={pesPoints}
            equilibriumR={H2_EQUILIBRIUM_BOND_LENGTH_ANGSTROM}
            currentR={bondLength}
          />
        </div>

        {optimizationHistory.length > 1 && (() => {
          const high = Math.max(...optimizationHistory);
          const low = Math.min(...optimizationHistory);
          return (
            <div className="mt-10" data-lab-visual="optimization-trace">
              <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">Optimization trajectory</p>
              <div
                className="grid grid-cols-[repeat(auto-fit,minmax(3px,1fr))] items-end gap-px border-b border-l border-border px-2 pt-4"
                style={{ height: 180 }}
                role="img"
                aria-label={`Optimization energy decreased from ${optimizationHistory[0].toFixed(5)} to ${optimizationHistory[optimizationHistory.length - 1].toFixed(5)} Hartree.`}
              >
                {optimizationHistory.map((energy, index) => {
                  const height = high === low ? 8 : 8 + ((energy - low) / (high - low)) * 140;
                  return <span key={index} className="block bg-accent/70" style={{ height }} aria-hidden="true" />;
                })}
              </div>
            </div>
          );
        })()}
      </LabNarrative>
    </ToolPageLayout>
  );
}
