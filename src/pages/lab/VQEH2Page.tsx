import { useMemo, useState } from "react";
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

  const handleOptimize = () => {
    const result = optimizeVQE(hamiltonian, theta, 0.3, 300);
    setTheta(((result.theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
    setBestEnergy(result.energy);
  };

  const handleBondLengthChange = (r: number) => {
    setBondLength(r);
    setBestEnergy(null);
  };

  return (
    <ToolPageLayout
      eyebrow="Lab"
      title="H₂ Ground State (VQE)"
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
          <div>
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

          <div className="mt-6">
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
      <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">E(θ) Curve</p>
      <EnergyThetaChart points={thetaCurve} currentTheta={theta} currentEnergy={currentEnergy} />

      <div className="mt-10">
        <p className="mb-4 font-mono text-mono-label uppercase text-text-muted">
          Potential Energy Surface — VQE (accent) vs. exact (dashed)
        </p>
        <PesChart
          points={pesPoints}
          equilibriumR={H2_EQUILIBRIUM_BOND_LENGTH_ANGSTROM}
          currentR={bondLength}
        />
      </div>
    </ToolPageLayout>
  );
}
