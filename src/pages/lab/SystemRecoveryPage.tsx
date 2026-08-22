import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Flame,
  Gauge,
  Microscope,
  Move,
  PlayCircle,
  Shield,
  Sparkles,
  Waves,
} from "lucide-react";
import PageShell from "../../components/PageShell.tsx";
import { simulate } from "../../lib/quantum/simulator.ts";
import { emptyCircuit, type Circuit } from "../../lib/quantum/circuit.ts";

type IonId = "Q1" | "Q3";
type NodeId = "sL1" | "sL2" | "gA" | "jTop" | "gB" | "sR1" | "sR2" | "jBottom" | "gC";

type FaultKey = "motion" | "route" | "readout" | "pulse";

interface TrapNode {
  id: NodeId;
  label: string;
  x: number;
  y: number;
  capacity: number;
}

interface TrapEdge {
  from: NodeId;
  to: NodeId;
}

const trapNodes: TrapNode[] = [
  { id: "sL1", label: "Store L1", x: 10, y: 58, capacity: 1 },
  { id: "sL2", label: "Store L2", x: 18, y: 84, capacity: 1 },
  { id: "gA", label: "Gate A", x: 28, y: 25, capacity: 2 },
  { id: "jTop", label: "Junction", x: 50, y: 12, capacity: 1 },
  { id: "gB", label: "Gate B", x: 72, y: 25, capacity: 2 },
  { id: "sR1", label: "Store R1", x: 90, y: 58, capacity: 1 },
  { id: "sR2", label: "Store R2", x: 82, y: 84, capacity: 1 },
  { id: "jBottom", label: "Junction", x: 50, y: 88, capacity: 1 },
  { id: "gC", label: "Gate C", x: 28, y: 74, capacity: 2 },
];

const trapEdges: TrapEdge[] = [
  { from: "sL1", to: "gA" },
  { from: "gA", to: "jTop" },
  { from: "jTop", to: "gB" },
  { from: "gB", to: "sR1" },
  { from: "sR1", to: "sR2" },
  { from: "sR2", to: "jBottom" },
  { from: "jBottom", to: "gC" },
  { from: "gC", to: "sL2" },
  { from: "gA", to: "gC" },
  { from: "gB", to: "sR2" },
  { from: "gC", to: "jBottom" },
  { from: "jTop", to: "sR2" },
];

const adjacency = trapEdges.reduce<Record<string, string[]>>((acc, edge) => {
  acc[edge.from] ??= [];
  acc[edge.to] ??= [];
  acc[edge.from].push(edge.to);
  acc[edge.to].push(edge.from);
  return acc;
}, {});

const nodeMap = Object.fromEntries(trapNodes.map((node) => [node.id, node]));

const missionLabels = [
  "ION CONTROL",
  "MOTION CONTROL",
  "TRANSPORT",
  "GATE CONTROL",
  "READOUT",
  "DIAGNOSE",
  "RECOVER",
];

const faultDeck: Record<FaultKey, { symptom: string; hint: string; fix: string }> = {
  motion: {
    symptom: "The ion still shakes after capture.",
    hint: "The motion meter is high and the beam is not centered.",
    fix: "Cool the chain until motion energy drops below the stable threshold.",
  },
  route: {
    symptom: "The pair is not inside the gate zone.",
    hint: "One qubit is still parked at the edge of the racetrack.",
    fix: "Route both targets to Gate A before firing the gate.",
  },
  readout: {
    symptom: "The histogram stays flat.",
    hint: "No measurement shots have been taken yet.",
    fix: "Run a batch of shots after preparing the state.",
  },
  pulse: {
    symptom: "The gate request is misaligned.",
    hint: "The control phase is not locked to the prepared pair.",
    fix: "Match the pulse settings, then press execute.",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function shortestPath(start: NodeId, goal: NodeId): NodeId[] | null {
  if (start === goal) return [start];
  const queue: NodeId[] = [start];
  const visited = new Set<NodeId>([start]);
  const previous = new Map<NodeId, NodeId>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const next of adjacency[current] ?? []) {
      if (visited.has(next as NodeId)) continue;
      visited.add(next as NodeId);
      previous.set(next as NodeId, current);
      if (next === goal) {
        const path: NodeId[] = [goal];
        let cursor = goal;
        while (previous.has(cursor)) {
          cursor = previous.get(cursor)!;
          path.unshift(cursor);
        }
        return path;
      }
      queue.push(next as NodeId);
    }
  }

  return null;
}

function nodeOccupancy(ions: Record<IonId, NodeId>, nodeId: NodeId): number {
  return (Object.values(ions).filter((value) => value === nodeId).length);
}

function makeHistogram(state: Circuit, shots: number) {
  const { probabilities, basisLabels } = simulate(state);
  const total = probabilities.reduce((acc, value) => acc + value, 0) || 1;
  const result: Record<string, number> = {};
  basisLabels.forEach((label, index) => {
    const count = Math.round((probabilities[index] / total) * shots);
    if (count > 0) result[label] = count;
  });
  return result;
}

function BitBar({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between text-sm text-white/74">
        <span>{label}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/44">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
        <div className="h-full rounded-full bg-cyan-300/80" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function MissionCard({
  title,
  icon: Icon,
  stage,
  active,
  online,
  children,
}: {
  title: string;
  icon: typeof Shield;
  stage: number;
  active?: boolean;
  online?: boolean;
  children: ReactNode;
}) {
  return (
    <article
      className={`rounded-[28px] border p-5 transition ${
        online ? "border-cyan-300/22 bg-cyan-300/[0.08]" : "border-white/10 bg-[#0b1018]"
      } ${active ? "shadow-[0_0_0_1px_rgba(103,232,249,0.14),0_24px_80px_rgba(0,0,0,0.35)]" : ""}`}
    >
      <div className="flex items-center gap-2 text-sm text-white/60">
        <Icon size={15} className={online ? "text-cyan-200/80" : "text-white/50"} />
        Level {stage}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <h3 className="text-2xl font-medium text-white">{title}</h3>
        {online && <CheckCircle2 size={15} className="text-cyan-200" />}
      </div>
      <div className="mt-4">{children}</div>
    </article>
  );
}

export default function SystemRecoveryPage() {
  const reduceMotion = useReducedMotion();
  const captureRef = useRef<HTMLDivElement | null>(null);
  const routeRef = useRef<HTMLDivElement | null>(null);
  const readoutRef = useRef<HTMLDivElement | null>(null);
  const bossRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<number[]>([]);

  const [openProgress, setOpenProgress] = useState(0);
  const [captureField, setCaptureField] = useState(62);
  const [captureFocus, setCaptureFocus] = useState(54);
  const [captureSuccess, setCaptureSuccess] = useState(false);

  const [coolAim, setCoolAim] = useState(58);
  const [coolPower, setCoolPower] = useState(64);
  const [motionEnergy, setMotionEnergy] = useState(0.92);
  const [coolSuccess, setCoolSuccess] = useState(false);

  const [ions, setIons] = useState<Record<IonId, NodeId>>({
    Q1: "sL1",
    Q3: "sR1",
  });
  const [selectedIon, setSelectedIon] = useState<IonId>("Q1");
  const [movingIon, setMovingIon] = useState<IonId | null>(null);
  const [routeMessage, setRouteMessage] = useState("Pick an ion, then route it to Gate A.");

  const [pulseAmplitude, setPulseAmplitude] = useState(62);
  const [pulseDuration, setPulseDuration] = useState(48);
  const [gateFired, setGateFired] = useState(false);
  const [gateLocked, setGateLocked] = useState(false);

  const [circuit, setCircuit] = useState<Circuit>(() => emptyCircuit(2));
  const [shots, setShots] = useState(0);
  const [histogram, setHistogram] = useState<Record<string, number>>({});

  const [diagnosticFault] = useState<FaultKey>("motion");
  const [diagnosticSolved, setDiagnosticSolved] = useState(false);

  const [bossBusy, setBossBusy] = useState(false);
  const [bossDone, setBossDone] = useState(false);
  const [bossLog, setBossLog] = useState<string[]>([]);

  useEffect(() => () => {
    timersRef.current.forEach(window.clearTimeout);
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
  };

  const openMachine = () => {
    setOpenProgress(100);
    captureRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  const isCaptureStable = captureField >= 58 && Math.abs(captureFocus - 50) <= 8;
  const isRouteReady = ions.Q1 === "gA" && ions.Q3 === "gA";
  const isPulseReady = gateLocked && gateFired;
  const isReadoutReady = shots >= 32 || Object.keys(histogram).length > 0;
  const completedCount = [openProgress >= 100, captureSuccess, coolSuccess, isRouteReady, isPulseReady, isReadoutReady, diagnosticSolved || bossDone].filter(Boolean).length;
  const readiness = Math.round((completedCount / 7) * 100);

  const missionState = useMemo(() => missionLabels.map((label, index) => ({
    label,
    done: [openProgress >= 100, captureSuccess, coolSuccess, isRouteReady, isPulseReady, isReadoutReady, diagnosticSolved || bossDone][index],
  })), [captureSuccess, coolSuccess, diagnosticSolved, isPulseReady, isReadoutReady, isRouteReady, openProgress, bossDone]);

  const animatePath = (ionId: IonId, path: NodeId[]) => {
    clearTimers();
    if (path.length <= 1) {
      setMovingIon(null);
      return;
    }

    setMovingIon(ionId);
    setRouteMessage(`Routing ${ionId} through ${path.length - 1} step${path.length - 1 === 1 ? "" : "s"}...`);
    path.slice(1).forEach((nodeId, index) => {
      const timer = window.setTimeout(() => {
        setIons((current) => ({ ...current, [ionId]: nodeId }));
        if (index === path.length - 2) {
          setMovingIon(null);
          setSelectedIon(ionId);
          setRouteMessage(ionId === "Q3" && nodeId === "gA" ? "Q1 and Q3 are locked into Gate A." : `${ionId} reached ${nodeMap[nodeId].label}.`);
        }
      }, (reduceMotion ? 0 : 360) * (index + 1));
      timersRef.current.push(timer);
    });
  };

  const routeIonToGateA = (ionId: IonId) => {
    const path = shortestPath(ions[ionId], "gA");
    if (!path) {
      setRouteMessage("That route is blocked.");
      return;
    }
    setSelectedIon(ionId);
    animatePath(ionId, path);
  };

  const routeBoth = () => {
    clearTimers();
    const q1Path = shortestPath(ions.Q1, "gA");
    const q3Path = shortestPath(ions.Q3, "gA");
    if (!q1Path || !q3Path) return;
    animatePath("Q1", q1Path);
    timersRef.current.push(
      window.setTimeout(() => {
        animatePath("Q3", q3Path);
      }, (reduceMotion ? 0 : 240) * Math.max(q1Path.length - 1, 1) + 240)
    );
  };

  const stabilizeCapture = () => {
    const stable = isCaptureStable;
    setCaptureSuccess(stable);
  };

  const autoCapture = () => {
    setCaptureField(72);
    setCaptureFocus(50);
    window.setTimeout(() => setCaptureSuccess(true), reduceMotion ? 0 : 260);
  };

  const coolPulse = () => {
    const alignment = 1 - Math.abs(coolAim - 50) / 50;
    const usefulPower = clamp(coolPower / 100, 0, 1) * alignment;
    const next = clamp(motionEnergy - usefulPower * 0.24 + (coolPower > 82 ? 0.05 : 0), 0, 1);
    setMotionEnergy(next);
    setCoolSuccess(next <= 0.28);
  };

  const autoCool = () => {
    setCoolAim(50);
    setCoolPower(68);
    setMotionEnergy(0.22);
    setCoolSuccess(true);
  };

  const lockPulse = () => {
    const aligned = pulseAmplitude >= 55 && pulseAmplitude <= 76 && pulseDuration >= 40 && pulseDuration <= 68;
    setGateLocked(aligned);
  };

  const executeGate = () => {
    setGateFired(true);
    if (isRouteReady) {
      setRouteMessage("Gate A executed: the prepared pair can now be measured.");
    }
  };

  const resetCircuit = () => {
    setCircuit(emptyCircuit(2));
    setHistogram({});
    setShots(0);
  };

  const applyGate = (kind: "H" | "X" | "CNOT") => {
    setCircuit((current) => {
      if (kind === "H") return { ...current, gates: [...current.gates, { id: `g${Date.now()}`, name: "H", qubit: 0, column: current.gates.length }] };
      if (kind === "X") return { ...current, gates: [...current.gates, { id: `g${Date.now()}`, name: "X", qubit: 0, column: current.gates.length }] };
      return { ...current, gates: [...current.gates, { id: `g${Date.now()}`, name: "CNOT", control: 0, qubit: 1, column: current.gates.length }] };
    });
  };

  const runShots = (count: number) => {
    const result = simulate(circuit);
    setHistogram(makeHistogram(circuit, count));
    setShots((value) => value + count);
    return result;
  };

  const diagnose = (choice: FaultKey) => {
    setDiagnosticSolved(choice === diagnosticFault);
  };

  const bossRun = () => {
    if (bossBusy) return;
    clearTimers();
    setBossBusy(true);
    setBossDone(false);
    setBossLog(["JOB ACCEPTED"]);
    const steps = [
      "SCHEDULE",
      "TRANSPORT",
      "MOTION CONTROL",
      "GATE OPERATION",
      "READOUT",
      "CLASSICAL RESULT",
    ];
    steps.forEach((step, index) => {
      const timer = window.setTimeout(() => {
        setBossLog((current) => [...current, step]);
        if (step === "TRANSPORT") {
          setOpenProgress(100);
          setCaptureSuccess(true);
          setCoolSuccess(true);
          routeBoth();
        }
        if (step === "MOTION CONTROL") autoCool();
        if (step === "GATE OPERATION") {
          setGateLocked(true);
          setGateFired(true);
        }
        if (step === "READOUT") {
          setCircuit((current) => ({
            ...current,
            gates: [
              { id: "b1", name: "H", qubit: 0, column: 0 },
              { id: "b2", name: "CNOT", control: 0, qubit: 1, column: 1 },
            ],
          }));
          setHistogram(makeHistogram({
            numQubits: 2,
            gates: [
              { id: "b1", name: "H", qubit: 0, column: 0 },
              { id: "b2", name: "CNOT", control: 0, qubit: 1, column: 1 },
            ],
          }, 100));
          setShots(100);
        }
        if (step === "CLASSICAL RESULT") {
          setDiagnosticSolved(true);
          setBossDone(true);
          setBossBusy(false);
        }
      }, (reduceMotion ? 0 : 520) * (index + 1));
      timersRef.current.push(timer);
    });
  };

  const goTo = (ref: RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <PageShell
      eyebrow="Playable hardware recovery"
      title="QUANTUM//LAB: System Recovery"
      description="Recover the trapped-ion machine one subsystem at a time. Open the hardware, stabilize the ion, route the pair, fire the gate, and read the result."
      path="/lab/system-recovery"
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(103,232,249,0.15),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.16),transparent_24%),linear-gradient(180deg,#070c13_0%,#04060b_100%)] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.42)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.42em] text-cyan-200/70">Start here</p>
              <h2 className="mt-2 text-[clamp(2.2rem,4vw,4.4rem)] font-medium leading-[0.95] tracking-[-0.06em] text-white">
                Bring the processor back online.
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/66">
                This is the recovery run. You do not need to know the full physics first. Follow the
                order, press the guided buttons, and watch each subsystem come back online.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={openMachine} className="rounded-full border border-cyan-300/24 bg-cyan-300/12 px-4 py-2 text-sm text-cyan-50 transition hover:bg-cyan-300/18">
                Open machine
              </button>
              <button type="button" onClick={() => goTo(routeRef)} className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white/84 transition hover:border-white/20 hover:bg-white/10">
                Skip to transport
              </button>
              <button type="button" onClick={bossRun} className="rounded-full border border-amber-300/24 bg-amber-300/12 px-4 py-2 text-sm text-amber-50 transition hover:bg-amber-300/18">
                Run full recovery
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {missionState.map((mission) => (
              <div key={mission.label} className={`rounded-[22px] border p-4 backdrop-blur ${mission.done ? "border-cyan-300/18 bg-cyan-300/[0.08]" : "border-white/10 bg-white/5"}`}>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/42">{mission.label}</p>
                <p className="mt-2 text-sm font-medium text-white">{mission.done ? "ONLINE" : "OFFLINE"}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[26px] border border-white/10 bg-black/22 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Sparkles size={15} className="text-cyan-200/80" />
                QPU readiness
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.28em] text-white/46">
                {readiness}%
              </span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#67e8f9,#a855f7,#fbbf24)] transition-all duration-500" style={{ width: `${readiness}%` }} />
            </div>
            <p className="mt-4 text-sm leading-6 text-white/64">
              Recovery is paced as a chain: capture, freeze, route, fire, readout, diagnose, recover.
            </p>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-[#0b1018] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.38)] md:p-8">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Cpu size={15} className="text-cyan-200/80" />
            System board
          </div>
          <div className="mt-4 grid gap-2">
            {missionState.map((mission) => (
              <div key={mission.label} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${mission.done ? "border-cyan-300/20 bg-cyan-300/10" : "border-white/10 bg-white/5"}`}>
                <span className="text-sm text-white">{mission.label}</span>
                {mission.done ? <CheckCircle2 size={14} className="text-cyan-200" /> : <span className="text-xs uppercase tracking-[0.28em] text-white/40">Waiting</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section ref={captureRef} className="mt-8 grid gap-6 lg:grid-cols-2">
        <MissionCard title="Capture the ion" icon={Shield} stage={1} active online={openProgress >= 100}>
          <p className="text-sm leading-6 text-white/66">
            The ion is escaping. Balance the field and center it until the motion trail collapses.
          </p>
          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="relative mx-auto h-44 overflow-hidden rounded-[22px] border border-white/8 bg-[radial-gradient(circle_at_50%_50%,rgba(110,206,255,0.22),transparent_34%),linear-gradient(180deg,#060a11_0%,#03050a_100%)]">
              <div className="absolute inset-x-5 top-6 h-px bg-white/10" />
              <div className="absolute inset-x-6 bottom-8 h-px bg-white/10" />
              <motion.div
                className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/40 bg-cyan-100/30"
                animate={{ x: clamp((50 - captureFocus) * 0.9, -18, 18), y: captureSuccess ? -6 : 0, scale: captureSuccess ? 1.18 : 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.35 }}
              />
              <motion.div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/10" animate={{ opacity: clamp((captureField - 40) / 60, 0.1, 1), scale: captureSuccess ? 1.1 : 1 }} />
              <div className="absolute inset-x-0 bottom-3 flex justify-center">
                <div className="rounded-full border border-white/8 bg-black/50 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/48">
                  field {captureField} / focus {captureFocus}
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block text-sm text-white/72">
                Trap strength
                <input type="range" min={0} max={100} value={captureField} onChange={(event) => setCaptureField(Number(event.currentTarget.value))} className="mt-2 w-full accent-cyan-300" />
              </label>
              <label className="block text-sm text-white/72">
                Centering
                <input type="range" min={0} max={100} value={captureFocus} onChange={(event) => setCaptureFocus(Number(event.currentTarget.value))} className="mt-2 w-full accent-cyan-300" />
              </label>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={stabilizeCapture} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/82">Stabilize ion</button>
            <button onClick={autoCapture} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-50">Show me once</button>
          </div>
          <p className="mt-3 text-sm text-white/66">{captureSuccess ? "ION LOCKED. The carrier is stable enough to work with." : "Hold the field steady and center the ion."}</p>
        </MissionCard>

        <MissionCard title="Cool the chain" icon={Waves} stage={2} active online={coolSuccess}>
          <p className="text-sm leading-6 text-white/66">
            Motion is too high for precision work. Aim the beam, keep the power in range, and reduce the shared motion.
          </p>
          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-end justify-between gap-3">
              <div className="flex gap-2">
                {["Yb+", "Ba+", "Yb+"].map((label, index) => (
                  <div key={label} className={`flex h-16 w-12 items-center justify-center rounded-2xl border text-xs ${index === 1 ? "border-amber-200/24 bg-amber-100/10 text-amber-50" : "border-white/10 bg-white/5 text-white/76"}`}>
                    {label}
                  </div>
                ))}
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/48">
                motion {Math.round(motionEnergy * 100)}%
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block text-sm text-white/72">
                Beam aim
                <input type="range" min={0} max={100} value={coolAim} onChange={(event) => setCoolAim(Number(event.currentTarget.value))} className="mt-2 w-full accent-amber-300" />
              </label>
              <label className="block text-sm text-white/72">
                Beam power
                <input type="range" min={0} max={100} value={coolPower} onChange={(event) => setCoolPower(Number(event.currentTarget.value))} className="mt-2 w-full accent-amber-300" />
              </label>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={coolPulse} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/82">Pulse cooling</button>
            <button onClick={autoCool} className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-50">Auto cool</button>
          </div>
          <p className="mt-3 text-sm text-white/66">{coolSuccess ? "MOTION STABILIZED. The chain is calm enough for transport." : "Aim matters. Overdrive is not better."}</p>
        </MissionCard>
      </section>

      <section ref={routeRef} className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <MissionCard title="Route the pair" icon={Move} stage={3} active online={isRouteReady}>
          <p className="text-sm leading-6 text-white/66">Select one ion or let the board route both for you. The pair has to arrive at Gate A.</p>
          <div className="mt-5 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(94,140,255,0.16),transparent_32%),linear-gradient(180deg,#111826_0%,#070b12_100%)] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Move size={15} className="text-cyan-200/80" />
                <span className="text-sm text-white/72">Bring Q1 and Q3 to Gate A.</span>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.28em] text-white/50">guided route</span>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(4,8,14,0.42),rgba(6,10,16,0.96))]">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                {trapEdges.map((edge) => {
                  const from = nodeMap[edge.from];
                  const to = nodeMap[edge.to];
                  const preview = (selectedIon ? shortestPath(ions[selectedIon], "gA") : null) ?? undefined;
                  const previewMatch = preview?.some((node, index) => index < preview.length - 1 && node === edge.from && preview[index + 1] === edge.to) || preview?.some((node, index) => index < preview.length - 1 && node === edge.to && preview[index + 1] === edge.from);
                  return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={previewMatch ? "rgba(125,243,255,0.95)" : "rgba(255,255,255,0.12)"} strokeWidth={previewMatch ? 1.7 : 1} strokeLinecap="round" strokeDasharray={previewMatch ? "0" : "1.4 2.2"} />;
                })}
              </svg>
              {trapNodes.map((node) => {
                const occupied = nodeOccupancy(ions, node.id);
                const selected = node.id === "gA";
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => {
                      if (movingIon) return;
                      const path = shortestPath(ions[selectedIon], node.id);
                      if (path) animatePath(selectedIon, path);
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition ${selected ? "border-cyan-200/60 bg-cyan-300/20" : "border-white/20 bg-white/6"} ${occupied ? "shadow-[0_0_24px_rgba(103,232,249,0.22)]" : ""}`}
                    style={{ left: `${node.x}%`, top: `${node.y}%`, width: occupied ? 18 : 14, height: occupied ? 18 : 14 }}
                    aria-label={node.label}
                  />
                );
              })}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[84%] rounded-[24px] border border-white/8 bg-black/20 px-5 py-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-white/42">Transport board</p>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/72">
                      {movingIon ? `Moving ${movingIon}` : routeMessage}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col items-start gap-3 md:flex-row md:items-end">
                    <div className="h-20 w-20 rounded-full border border-cyan-200/18 bg-[radial-gradient(circle,rgba(216,245,255,0.94)_0%,rgba(107,210,255,0.55)_22%,rgba(26,56,80,0.24)_52%,rgba(9,13,20,0.05)_72%)] shadow-[0_0_40px_rgba(112,214,255,0.22)]" />
                    <div className="flex-1">
                      <p className="text-lg font-medium tracking-[-0.03em] text-white">Selected ion: {selectedIon}</p>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-white/64">Tap a route button, or let the helper finish the transport in one go.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setSelectedIon("Q1")} className={`rounded-full border px-4 py-2 text-sm ${selectedIon === "Q1" ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-50" : "border-white/10 bg-white/5 text-white/82"}`}>Select Q1</button>
              <button onClick={() => setSelectedIon("Q3")} className={`rounded-full border px-4 py-2 text-sm ${selectedIon === "Q3" ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-50" : "border-white/10 bg-white/5 text-white/82"}`}>Select Q3</button>
              <button onClick={() => routeIonToGateA("Q1")} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/82">Route Q1 to Gate A</button>
              <button onClick={() => routeIonToGateA("Q3")} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/82">Route Q3 to Gate A</button>
              <button onClick={routeBoth} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-50">Do both for me</button>
            </div>
          </div>
          <p className="mt-3 text-sm text-white/66">{isRouteReady ? "PAIR LOCKED. Both ions are ready in the same zone." : "Bring both targets to Gate A before firing the gate."}</p>
        </MissionCard>

        <MissionCard title="Fire the gate" icon={Flame} stage={4} active online={isPulseReady}>
          <p className="text-sm leading-6 text-white/66">Match the conceptual pulse settings, then execute the physical operation.</p>
          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Q1", ready: isRouteReady },
                { label: "Q3", ready: isRouteReady },
                { label: "Gate A", ready: true },
              ].map((item) => (
                <div key={item.label} className={`rounded-2xl border px-3 py-4 text-center text-sm ${item.ready ? "border-cyan-300/20 bg-cyan-300/10 text-white" : "border-white/10 bg-white/5 text-white/70"}`}>
                  {item.label}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <label className="block text-sm text-white/72">
                Pulse amplitude
                <input type="range" min={0} max={100} value={pulseAmplitude} onChange={(event) => setPulseAmplitude(Number(event.currentTarget.value))} className="mt-2 w-full accent-cyan-300" />
              </label>
              <label className="block text-sm text-white/72">
                Pulse duration
                <input type="range" min={0} max={100} value={pulseDuration} onChange={(event) => setPulseDuration(Number(event.currentTarget.value))} className="mt-2 w-full accent-cyan-300" />
              </label>
            </div>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 p-3 text-sm text-white/68">
              {gateFired ? "GATE EXECUTED. The software request became a physical hardware action." : "Align the control pulse, then press execute."}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={lockPulse} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/82">Lock pulse</button>
            <button onClick={executeGate} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-50">Execute gate</button>
          </div>
          <p className="mt-3 text-sm text-white/66">{isPulseReady ? "PULSE LOCKED. The gate can now fire cleanly." : "Keep the pair ready, then match the pulse."}</p>
        </MissionCard>
      </section>

      <section ref={readoutRef} className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <MissionCard title="Read the state" icon={Microscope} stage={5} active online={isReadoutReady}>
          <p className="text-sm leading-6 text-white/66">Prepare a tiny 2-qubit circuit, then take repeated shots and inspect the histogram.</p>
          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={resetCircuit} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80">Reset |00⟩</button>
              <button onClick={() => applyGate("H")} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80">Apply H</button>
              <button onClick={() => applyGate("X")} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80">Apply X</button>
              <button onClick={() => applyGate("CNOT")} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80">Entangle</button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => runShots(32)} className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-50">
                Run 32 shots
              </button>
              <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/72">Shots: {shots}</div>
            </div>
            <div className="mt-4 grid gap-2">
              {Object.keys(histogram).length > 0 ? (
                Object.entries(histogram).map(([label, value]) => <BitBar key={label} label={label} value={value} total={32} />)
              ) : (
                <p className="text-sm text-white/56">Run shots to build the classical result histogram.</p>
              )}
            </div>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 p-3 text-sm text-white/70">
              Current state: {simulate(circuit).statevector.map((amp, index) => `${index.toString(2).padStart(2, "0")} ${amp.re.toFixed(2)}`).join("   ")}
            </div>
          </div>
        </MissionCard>

        <MissionCard title="Diagnose the fault" icon={AlertTriangle} stage={6} active online={diagnosticSolved}>
          <p className="text-sm leading-6 text-white/66">No tutorial arrows here. Read the symptom and choose the fix.</p>
          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="rounded-2xl border border-amber-300/18 bg-amber-300/8 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-100/80">Symptom</p>
              <p className="mt-2 text-sm leading-6 text-white">{faultDeck[diagnosticFault].symptom}</p>
              <p className="mt-2 text-sm leading-6 text-white/66">{faultDeck[diagnosticFault].hint}</p>
            </div>
            <div className="mt-4 grid gap-2">
              {(
                [
                  ["motion", "Check cooling first"],
                  ["route", "Re-route the pair"],
                  ["readout", "Run more shots"],
                  ["pulse", "Retune the pulse"],
                ] as Array<[FaultKey, string]>
              ).map(([choice, label]) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => diagnose(choice)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    diagnosticSolved && choice === diagnosticFault
                      ? "border-cyan-300/24 bg-cyan-300/10 text-white"
                      : "border-white/10 bg-white/5 text-white/80 hover:border-white/18 hover:bg-white/8"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 p-3 text-sm text-white/70">
              {diagnosticSolved ? "FAULT CLEARED. The repair logic is correct." : faultDeck[diagnosticFault].fix}
            </div>
          </div>
        </MissionCard>
      </section>

      <section ref={bossRef} className="mt-6">
        <div className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.14),transparent_24%),linear-gradient(180deg,#090d14_0%,#05070b_100%)] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.42)] md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Gauge size={15} className="text-cyan-200/80" />
                Level 7
              </div>
              <h3 className="mt-2 text-[clamp(1.8rem,3vw,3rem)] font-medium tracking-[-0.05em] text-white">Run the full machine</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/66">This final step strings the whole loop together and turns the recovery into a single executable job.</p>
            </div>
            <button onClick={bossRun} className="inline-flex items-center gap-2 rounded-full border border-amber-300/24 bg-amber-300/12 px-4 py-2 text-sm text-amber-50">
              <PlayCircle size={14} />
              Run quantum job
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {["Prepare Q1 + Q3", "Interact Q1 + Q3", "Measure Q1 + Q3", "Return 100 shots"].map((step, index) => (
              <div key={step} className={`rounded-2xl border px-4 py-4 ${bossDone ? "border-cyan-300/24 bg-cyan-300/10" : index === 0 || bossBusy ? "border-white/10 bg-white/5" : "border-white/6 bg-white/4"}`}>
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/42">0{index + 1}</p>
                <p className="mt-2 text-sm font-medium text-white">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
              <Sparkles size={15} className="text-cyan-200/80" />
              Recovery log
            </div>
            <div className="mt-4 space-y-2">
              {bossLog.length > 0 ? bossLog.map((line) => (
                <div key={line} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white/80">{line}</div>
              )) : (
                <p className="text-sm text-white/58">Press the button to run the machine from schedule to classical result.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <ArrowRight size={15} className="text-cyan-200/80" />
            You now have a working recovery loop
          </div>
          <button type="button" onClick={openMachine} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/84">
            Replay from machine open
          </button>
        </div>
      </div>
    </PageShell>
  );
}

