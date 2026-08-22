import { useEffect, useMemo, useRef, useState, type ComponentType, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { ArrowRight, Cpu, PlayCircle, RotateCcw, ScanSearch, Shield, Sparkles, SquareDashedBottomCode, ToggleLeft, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.tsx";

type Vec2 = { x: number; z: number };
type StationId = "console" | "control" | "optical" | "qpu" | "readout";
type FocusId = StationId | null;
type Proximity = "far" | "discover" | "ready" | "focused";
type ExperimentId = "calibration" | "bell";
type TutorialMode = "guided" | "standard" | "explorer";
type CameraMode = "walk" | "overview" | "macro";
type StoryAct =
  | "NORMAL"
  | "ANOMALY"
  | "DIAGNOSIS"
  | "EMERGENCY_RESPONSE"
  | "STABILIZING"
  | "RECOVERY_CHECK"
  | "CALIBRATION"
  | "VALIDATION"
  | "RECOVERED"
  | "MYSTERY";
type LabLightingMode = "normal" | "warning" | "critical" | "recovery";
type EmergencyResponse = "abort-all" | "isolate-ch02" | "safe-mode" | null;
type ChannelStatus = "idle" | "transmitting" | "isolated" | "safe";
type PulseJobStatus = "queued" | "active" | "complete" | "terminated";
type PulseJob = {
  id: string;
  channel: "CH-00" | "CH-01" | "CH-02" | "CH-03";
  label: string;
  status: PulseJobStatus;
};
type LabLogEntry = {
  time: string;
  message: string;
};
type BellTaskStep =
  | "GO_TO_CONSOLE"
  | "BUILD_H"
  | "BUILD_CNOT"
  | "VERIFY_CONTROL"
  | "OPEN_QPU"
  | "QUEUE_EXPERIMENT"
  | "RUNNING"
  | "ANALYZE_RESULTS"
  | "QUIZ"
  | "COMPLETE";
type BellJobStatus = "idle" | "queued" | "uploading" | "control" | "executing" | "measuring" | "readout" | "complete";
type BellTaskState = {
  step: BellTaskStep;
  circuit: {
    hadamardQ0: boolean;
    cnotQ0Q1: boolean;
  };
  hardware: {
    controlVerified: boolean;
    qpuOpened: boolean;
    qpuInspected: boolean;
  };
  experiment: {
    selectedShots: number;
    jobStatus: BellJobStatus;
  };
  results: {
    shots: number;
    counts: { "00": number; "01": number; "10": number; "11": number } | null;
  };
  quiz: {
    answered: boolean;
    correct: boolean;
    attempts: number;
    choice: "A" | "B" | "C" | null;
  };
  completed: boolean;
};

type StationSpec = {
  id: StationId;
  name: string;
  position: Vec2;
  size: Vec2;
  prompt: string;
  description: string;
  kind: "console" | "rack" | "optical" | "qpu" | "readout";
};

type WorldState = {
  storyAct: StoryAct;
  lightingMode: LabLightingMode;
  emergencyActive: boolean;
  emergencyResponse: EmergencyResponse;
  qpuTemperatureMk: number;
  qpuTargetTemperatureMk: number;
  calibrationState: "valid" | "invalid" | "running" | "complete";
  qpuValidated: boolean;
  systemTested: boolean;
  opticalAligned: boolean;
  timingAligned: boolean;
  readoutArmed: boolean;
  qpuLatchReleased: boolean;
  qpuDoorOpen: boolean;
  bellPrepared: boolean;
  experimentSelected: ExperimentId | null;
  experimentRunning: boolean;
  calibrationOffset: number;
  bellShots: number;
  bellHistogram: { zeroZero: number; oneOne: number; other: number };
  opticalYaw: number;
  opticalPitch: number;
  opticalCoupling: number;
  whyOpen: boolean;
  tutorialMode: TutorialMode;
  cameraMode: CameraMode;
  focus: FocusId;
  paused: boolean;
  overviewOpen: boolean;
  bellTask: BellTaskState;
  cryogenics: {
    stable: boolean;
    heatLoad: "normal" | "high";
    stage50K: number;
    stage4K: number;
    stage100mK: number;
    mixingChamberMk: number;
  };
  control: {
    clockLocked: boolean;
    channels: {
      "CH-00": ChannelStatus;
      "CH-01": ChannelStatus;
      "CH-02": ChannelStatus;
      "CH-03": ChannelStatus;
    };
    pulseQueue: PulseJob[];
  };
  readout: {
    ready: boolean;
    fidelity: number;
    buffer: number;
  };
  experiment: {
    circuit: Array<"H" | "X" | "Z" | "CNOT" | "M">;
    shotsRequested: number;
    shotsCompleted: number;
    jobState: "idle" | "compiling" | "uploading" | "executing" | "measuring" | "analyzing" | "done";
    result: { "00": number; "01": number; "10": number; "11": number; correlation: number } | null;
  };
  logs: LabLogEntry[];
  mystery: {
    unknownJobVisible: boolean;
    unknownJobId: string;
  };
};

const ROOM = {
  width: 24,
  depth: 18,
  height: 4.4,
};

const STATIONS: StationSpec[] = [
  {
    id: "console",
    name: "Main Console",
    position: { x: -3.8, z: 3.0 },
    size: { x: 2.4, z: 1.4 },
    prompt: "Inspect the control desk.",
    description: "The control desk shows the health of the whole machine.",
    kind: "console",
  },
  {
    id: "control",
    name: "Control Electronics",
    position: { x: -4.5, z: 0.5 },
    size: { x: 1.8, z: 1.0 },
    prompt: "Inspect the timing rack.",
    description: "Classical electronics coordinate timing and control signals.",
    kind: "rack",
  },
  {
    id: "optical",
    name: "Optical / Laser Control",
    position: { x: -0.2, z: -2.4 },
    size: { x: 2.8, z: 1.5 },
    prompt: "Inspect the laser enclosure.",
    description: "Controlled light is routed through enclosed optics toward the processor.",
    kind: "optical",
  },
  {
    id: "qpu",
    name: "Vacuum / QPU Enclosure",
    position: { x: 1.9, z: 0.1 },
    size: { x: 3.4, z: 2.2 },
    prompt: "Open the service panel.",
    description: "The processor is protected inside this enclosure.",
    kind: "qpu",
  },
  {
    id: "readout",
    name: "Readout Station",
    position: { x: 4.4, z: -1.8 },
    size: { x: 1.8, z: 1.2 },
    prompt: "Inspect the detector stack.",
    description: "This subsystem turns signal into classical data.",
    kind: "readout",
  },
];

const STATION_GUIDES: Record<StationId, { objective: string; howTo: string; why: string }> = {
  console: {
    objective: "Check whether the classical control chain is healthy.",
    howTo: "Approach the desk and run the diagnostic from the console surface or the control panel buttons.",
    why: "The quantum device only works when the classical electronics are synchronized and stable.",
  },
  control: {
    objective: "Inspect the timing rack that coordinates pulse delivery.",
    howTo: "Walk beside the rack to read the timing display and see the sync indicators.",
    why: "Nanosecond-level timing determines whether the control pulses arrive at the right moment.",
  },
  optical: {
    objective: "Align the laser path so the beam couples cleanly into the trap.",
    howTo: "Move near the optical table and tune the beam path until the coupling indicator turns healthy.",
    why: "If the beam misses the ion trap, the experiment loses fidelity even if everything else is correct.",
  },
  qpu: {
    objective: "Open the enclosure safely and inspect the trapped-ion processor.",
    howTo: "Release the latch, open the door, then inspect the ion chain and housing.",
    why: "The QPU is the protected physical center of the system, but it still depends on everything around it.",
  },
  readout: {
    objective: "Convert the quantum outcome into classical data you can analyze.",
    howTo: "Approach the detector stack and arm the readout before measuring the experiment.",
    why: "Measurement turns many repeated quantum shots into a probability distribution you can read.",
  },
};

const GLOSSARY = [
  {
    term: "Qubit",
    definition: "A quantum information unit represented here by trapped ions inside the QPU enclosure.",
  },
  {
    term: "Ion trap",
    definition: "The physical hardware that holds ions in place so lasers can manipulate them precisely.",
  },
  {
    term: "Fidelity",
    definition: "A simple measure of how closely the lab output matches the intended experiment.",
  },
  {
    term: "Shot",
    definition: "One repeated run of the experiment that contributes to the final measurement histogram.",
  },
];

const BELL_TASK_STORAGE_KEY = "quantumLab.task05";
const BELL_TASK_TOTAL_STEPS = 7;

function createBellTaskState(): BellTaskState {
  return {
    step: "GO_TO_CONSOLE",
    circuit: { hadamardQ0: false, cnotQ0Q1: false },
    hardware: { controlVerified: false, qpuOpened: false, qpuInspected: false },
    experiment: { selectedShots: 1024, jobStatus: "idle" },
    results: { shots: 0, counts: null },
    quiz: { answered: false, correct: false, attempts: 0, choice: null },
    completed: false,
  };
}

function loadBellTaskState(): BellTaskState {
  if (typeof window === "undefined") {
    return createBellTaskState();
  }

  const fallback = createBellTaskState();
  const raw = window.localStorage.getItem(BELL_TASK_STORAGE_KEY);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<BellTaskState>;
    return {
      ...fallback,
      ...parsed,
      circuit: { ...fallback.circuit, ...(parsed.circuit ?? {}) },
      hardware: { ...fallback.hardware, ...(parsed.hardware ?? {}) },
      experiment: { ...fallback.experiment, ...(parsed.experiment ?? {}) },
      results: { ...fallback.results, ...(parsed.results ?? {}) },
      quiz: { ...fallback.quiz, ...(parsed.quiz ?? {}) },
    };
  } catch {
    return fallback;
  }
}

const EMERGENCY_STATE_STORAGE_KEY = "quantumLab.emergencyScenario.v1";

function createWorldState(): WorldState {
  return {
    storyAct: "NORMAL",
    lightingMode: "normal",
    emergencyActive: false,
    emergencyResponse: null,
    qpuTemperatureMk: 15.4,
    qpuTargetTemperatureMk: 15.4,
    calibrationState: "valid",
    qpuValidated: false,
    systemTested: false,
    opticalAligned: false,
    timingAligned: false,
    readoutArmed: false,
    qpuLatchReleased: false,
    qpuDoorOpen: false,
    bellPrepared: false,
    experimentSelected: null,
    experimentRunning: false,
    calibrationOffset: 0.32,
    bellShots: 0,
    bellHistogram: { zeroZero: 0, oneOne: 0, other: 0 },
    opticalYaw: 0.24,
    opticalPitch: -0.08,
    opticalCoupling: 0.63,
    whyOpen: false,
    tutorialMode: "guided",
    cameraMode: "walk",
    focus: null,
    paused: false,
    overviewOpen: false,
    bellTask: loadBellTaskState(),
    cryogenics: {
      stable: true,
      heatLoad: "normal",
      stage50K: 47.9,
      stage4K: 4.3,
      stage100mK: 16.8,
      mixingChamberMk: 15.4,
    },
    control: {
      clockLocked: true,
      channels: {
        "CH-00": "idle",
        "CH-01": "idle",
        "CH-02": "idle",
        "CH-03": "idle",
      },
      pulseQueue: [
        { id: "#8391", channel: "CH-00", label: "H(Q0)", status: "complete" },
        { id: "#8392", channel: "CH-01", label: "CNOT(Q0,Q1)", status: "complete" },
        { id: "#8393", channel: "CH-02", label: "continuous-drive", status: "active" },
        { id: "#8394", channel: "CH-02", label: "unknown", status: "queued" },
        { id: "#8395", channel: "CH-02", label: "unknown", status: "queued" },
      ],
    },
    readout: {
      ready: true,
      fidelity: 0.975,
      buffer: 0,
    },
    experiment: {
      circuit: ["H", "CNOT"],
      shotsRequested: 1024,
      shotsCompleted: 0,
      jobState: "idle",
      result: null,
    },
    logs: [
      { time: "23:13:41", message: "QPU temp rising" },
      { time: "23:13:45", message: "CH-02 high duty cycle" },
      { time: "23:13:48", message: "thermal warning" },
    ],
    mystery: {
      unknownJobVisible: false,
      unknownJobId: "#8393",
    },
  };
}

function loadWorldState(): WorldState {
  const fallback = createWorldState();
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(EMERGENCY_STATE_STORAGE_KEY);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<WorldState>;
    return {
      ...fallback,
      ...parsed,
      cryogenics: { ...fallback.cryogenics, ...(parsed.cryogenics ?? {}) },
      control: {
        ...fallback.control,
        ...(parsed.control ?? {}),
        channels: { ...fallback.control.channels, ...(parsed.control?.channels ?? {}) },
        pulseQueue: Array.isArray(parsed.control?.pulseQueue) ? parsed.control!.pulseQueue : fallback.control.pulseQueue,
      },
      readout: { ...fallback.readout, ...(parsed.readout ?? {}) },
      experiment: { ...fallback.experiment, ...(parsed.experiment ?? {}) },
      logs: Array.isArray(parsed.logs) ? parsed.logs : fallback.logs,
      mystery: { ...fallback.mystery, ...(parsed.mystery ?? {}) },
      bellTask: { ...fallback.bellTask, ...(parsed.bellTask ?? {}) },
    };
  } catch {
    return fallback;
  }
}

function getBellMissionStep(task: BellTaskState) {
  const stepIndex =
    task.step === "GO_TO_CONSOLE"
      ? 1
      : task.step === "BUILD_H" || task.step === "BUILD_CNOT"
        ? 2
        : task.step === "VERIFY_CONTROL"
          ? 3
          : task.step === "OPEN_QPU"
            ? 4
            : task.step === "QUEUE_EXPERIMENT"
              ? 5
              : task.step === "RUNNING" || task.step === "ANALYZE_RESULTS"
                ? 6
                : 7;

  const title =
    task.step === "GO_TO_CONSOLE"
      ? "Go to Main Console"
      : task.step === "BUILD_H"
        ? "Build Bell circuit"
        : task.step === "BUILD_CNOT"
          ? "Add entangling gate"
          : task.step === "VERIFY_CONTROL"
            ? "Verify control electronics"
            : task.step === "OPEN_QPU"
              ? "Open the QPU enclosure"
              : task.step === "QUEUE_EXPERIMENT"
                ? "Queue Bell experiment"
                : task.step === "RUNNING"
                  ? "Running Bell shots"
                  : task.step === "ANALYZE_RESULTS"
                    ? "Analyze measurement results"
                    : task.step === "QUIZ"
                      ? "Answer the check question"
                      : "Bell state complete";

  const detail =
    task.step === "GO_TO_CONSOLE"
      ? "Walk to the Main Console and begin the Bell workflow."
      : task.step === "BUILD_H"
        ? "Place a Hadamard gate on q0."
        : task.step === "BUILD_CNOT"
          ? "Add CNOT from q0 to q1."
          : task.step === "VERIFY_CONTROL"
            ? "Run the control signal check before opening the processor."
            : task.step === "OPEN_QPU"
              ? "Open the QPU and inspect the processor assembly."
              : task.step === "QUEUE_EXPERIMENT"
                ? "Select 1024 shots and queue the Bell job."
                : task.step === "RUNNING"
                  ? "The circuit is being uploaded, executed, and measured."
                  : task.step === "ANALYZE_RESULTS"
                    ? "Look for strong 00 / 11 correlations in the histogram."
                    : task.step === "QUIZ"
                      ? "Choose the outcome pattern that matches a Bell state."
                      : "You prepared a Bell state and collected measurement data.";

  const checklist =
    task.step === "GO_TO_CONSOLE"
      ? ["Go to Main Console", "Begin the Bell task", "Open the circuit workspace"]
      : task.step === "BUILD_H"
        ? ["Place H on q0", "Create superposition", "Then place CNOT"]
        : task.step === "BUILD_CNOT"
          ? ["Place CNOT q0→q1", "Entangle the qubits", "Verify the circuit"]
          : task.step === "VERIFY_CONTROL"
            ? ["Run signal check", "Verify timing", "Unlock the QPU"]
            : task.step === "OPEN_QPU"
              ? ["Open the QPU", "Inspect the processor", "Return to console"]
              : task.step === "QUEUE_EXPERIMENT"
                ? ["Select 1024 shots", "Queue Bell experiment", "Run the job"]
                : task.step === "RUNNING"
                  ? ["Control pulses", "QPU execution", "Readout acquisition"]
                  : task.step === "ANALYZE_RESULTS"
                    ? ["Study the histogram", "Look for 00 / 11", "Answer the concept question"]
                    : task.step === "QUIZ"
                      ? ["Choose the correlated pattern", "Confirm Bell signature", "Complete the task"]
                      : ["Bell state prepared", "Results analyzed", "Task complete"];

  return {
    label: "TASK 05",
    title,
    detail,
    progressLabel: `${stepIndex} / ${BELL_TASK_TOTAL_STEPS}`,
    progressValue: (stepIndex / BELL_TASK_TOTAL_STEPS) * 100,
    checklist,
    completed: task.completed,
  };
}

const WALL_THICKNESS = 0.2;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function distance2(a: Vec2, b: Vec2) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function nearlyFacing(player: Vec2, yaw: number, station: StationSpec) {
  const dx = station.position.x - player.x;
  const dz = station.position.z - player.z;
  const dir = new THREE.Vector2(Math.sin(yaw), -Math.cos(yaw));
  const toStation = new THREE.Vector2(dx, dz).normalize();
  return dir.dot(toStation) > 0.65;
}

function useCanvasTexture(lines: string[], accent = "#67e8f9") {
  const texture = useMemo(() => {
    if (typeof document === "undefined") {
      const fallback = new THREE.Texture();
      fallback.needsUpdate = true;
      return fallback;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context unavailable");
    }

    ctx.fillStyle = "#ECEDEA";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "rgba(255,255,255,0.72)");
    grad.addColorStop(1, "rgba(255,255,255,0.34)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 8;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

    ctx.fillStyle = "#222829";
    ctx.font = "700 64px Arial";
    ctx.fillText(lines[0] ?? "", 56, 110);

    ctx.font = "400 34px Arial";
    ctx.fillStyle = "#30383B";
    lines.slice(1).forEach((line, index) => {
      ctx.fillText(line, 56, 180 + index * 58);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [accent, lines.join("|")]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function StationLabel({
  text,
  active,
}: {
  text: string;
  active?: boolean;
}) {
  return (
    <Html center>
      <div
        className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.28em] backdrop-blur-sm ${
          active ? "border-[#38C6A3]/70 bg-[#ECEDEA]/95 text-[#222829]" : "border-[#B9BEC0]/60 bg-[#ECEDEA]/85 text-[#30383B]/80"
        }`}
      >
        {text}
      </div>
    </Html>
  );
}

function CameraRig({
  player,
  yaw,
  pitch,
  jumpHeight,
  focus,
  cameraMode,
}: {
  player: Vec2;
  yaw: number;
  pitch: number;
  jumpHeight: number;
  focus: FocusId;
  cameraMode: CameraMode;
}) {
  const { camera } = useThree();
  const focusTargets: Record<StationId, { position: [number, number, number]; target: [number, number, number]; fov: number }> = {
    console: { position: [-4.4, 1.9, 5.0], target: [-3.8, 1.5, 3.0], fov: 50 },
    control: { position: [-5.1, 1.9, 1.7], target: [-4.5, 1.45, 0.5], fov: 50 },
    optical: { position: [0.2, 1.88, -1.1], target: [-0.2, 1.38, -2.4], fov: 48 },
    qpu: { position: [3.3, 1.82, 2.4], target: [2.2, 1.44, 0.15], fov: 46 },
    readout: { position: [5.0, 1.88, -0.1], target: [4.4, 1.4, -1.7], fov: 50 },
  };

  useFrame(() => {
    if (cameraMode === "overview") {
      const perspective = camera as THREE.PerspectiveCamera;
      camera.position.lerp(new THREE.Vector3(0, 7.5, 7.8), 0.08);
      camera.lookAt(0, 1.0, 0);
      perspective.fov = lerp(perspective.fov, 44, 0.08);
      perspective.updateProjectionMatrix();
      return;
    }

    if (focus) {
      const target = focusTargets[focus];
      const adjustedTarget = cameraMode === "macro" && focus === "qpu" ? [1.9, 1.25, 0.15] as [number, number, number] : target.target;
      const adjustedPosition = cameraMode === "macro" && focus === "qpu" ? [2.8, 1.7, 1.9] as [number, number, number] : target.position;
      const perspective = camera as THREE.PerspectiveCamera;
      camera.position.lerp(new THREE.Vector3(adjustedPosition[0], adjustedPosition[1], adjustedPosition[2]), 0.08);
      camera.lookAt(adjustedTarget[0], adjustedTarget[1], adjustedTarget[2]);
      perspective.fov = lerp(perspective.fov, target.fov, 0.08);
      perspective.updateProjectionMatrix();
      return;
    }

    const forward = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
    const desiredPosition = new THREE.Vector3(player.x, 0, player.z)
      .addScaledVector(forward, -3.85)
      .add(new THREE.Vector3(0, 2.15 + jumpHeight * 0.65, 0));
    camera.position.lerp(desiredPosition, 0.11);
    const lookTarget = new THREE.Vector3(player.x, 1.25 + jumpHeight * 0.9 + pitch * 0.45, player.z).addScaledVector(forward, 1.0);
    camera.lookAt(lookTarget);
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.fov = lerp(perspective.fov, 58, 0.08);
    perspective.updateProjectionMatrix();
  });

  return null;
}

function MiniMap({
  player,
  yaw,
  enteredLab,
}: {
  player: Vec2;
  yaw: number;
  enteredLab: boolean;
}) {
  const toPct = (value: number, axis: "x" | "z") => {
    const size = axis === "x" ? ROOM.width : ROOM.depth;
    return ((value + size / 2) / size) * 100;
  };

  return (
    <div className="absolute right-4 top-4 z-20 w-[170px] rounded-[20px] border border-white/10 bg-black/48 p-3 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.36em] text-[#7657C8]/70">Mini map</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#30383B]/46">{enteredLab ? "active" : "entry"}</p>
      </div>
      <div className="relative mt-3 h-[120px] rounded-[16px] border border-[#334155]/60 bg-[linear-gradient(180deg,rgba(15,23,42,0.95)_0%,rgba(2,6,23,0.9)_100%)]">
        <div className="absolute inset-[10px] rounded-[12px] border border-[#334155]/50" />
        <div className="absolute left-[10px] top-1/2 h-px w-[calc(100%-20px)] bg-[#334155]/50" />
        <div className="absolute top-[10px] left-1/2 h-[calc(100%-20px)] w-px bg-[#334155]/50" />
        {STATIONS.map((station) => (
          <div
            key={station.id}
            className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7657C8]/70 shadow-[0_0_10px_rgba(118,87,200,0.35)]"
            style={{
              left: `${toPct(station.position.x, "x")}%`,
              top: `${toPct(station.position.z, "z")}%`,
            }}
          />
        ))}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${toPct(player.x, "x")}%`,
            top: `${toPct(player.z, "z")}%`,
          }}
        >
          <div
            className="h-3 w-3 rounded-full bg-[#38C6A3] shadow-[0_0_14px_rgba(56,198,163,0.9)]"
            style={{ transform: `rotate(${yaw}rad)` }}
          />
          <div className="mx-auto mt-1 h-0 w-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#38C6A3]/90" />
        </div>
      </div>
      <p className="mt-2 text-[10px] leading-4 text-[#30383B]/62">Move with WASD. Space jumps. E interacts when labels appear.</p>
    </div>
  );
}

function RailLight({ position, width = 1.5 }: { position: [number, number, number]; width?: number }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, 0.1, 0.18]} />
        <meshStandardMaterial color="#ECEDEA" emissive="#3A8DDE" emissiveIntensity={0.22} />
      </mesh>
    </group>
  );
}

function ConsoleDisplay({
  tested,
  experimentSelected,
  experimentRunning,
  state,
}: {
  tested: boolean;
  experimentSelected: ExperimentId | null;
  experimentRunning: boolean;
  state: WorldState;
}) {
  const queueLabel = state.storyAct === "VALIDATION" ? "RECOVERY VALIDATION" : experimentSelected === "bell" ? "BELL STATE" : "CALIBRATION";
  const texture = useCanvasTexture(
    [
      "Q-LAB // SYSTEM",
      `QPU            ${state.qpuTemperatureMk.toFixed(1)} mK`,
      `CRYO           ${state.cryogenics.stable ? "STABLE" : "DRIFT"}`,
      `CONTROL        ${tested ? "ONLINE" : "STANDBY"}`,
      `CH-02          ${state.control.channels["CH-02"].toUpperCase()}`,
      `CALIBRATION    ${state.calibrationState.toUpperCase()}`,
      `VALIDATION     ${state.bellPrepared ? "ARMED" : "STANDBY"}`,
      `READOUT        ${state.readout.ready ? "READY" : "STANDBY"}`,
      `QUEUE          ${queueLabel}`,
      `EXPERIMENT     ${experimentRunning ? "RUNNING" : state.storyAct}`,
    ],
    "#67e8f9"
  );

  return (
    <mesh position={[0, 0.72, 0.67]}>
      <planeGeometry args={[1.55, 0.82]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function MainConsole({
  tested,
  experimentSelected,
  experimentRunning,
  state,
}: {
  tested: boolean;
  experimentSelected: ExperimentId | null;
  experimentRunning: boolean;
  state: WorldState;
}) {
  return (
    <group position={[-3.8, 0, 3.0]}>
      <mesh castShadow receiveShadow position={[0, 0.48, 0]}>
        <boxGeometry args={[2.6, 0.9, 1.3]} />
        <meshStandardMaterial color="#252B2D" roughness={0.56} metalness={0.22} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.95, -0.02]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[2.35, 0.16, 1.1]} />
        <meshStandardMaterial color="#30383B" roughness={0.46} metalness={0.3} />
      </mesh>
      <ConsoleDisplay
        tested={tested}
        experimentSelected={experimentSelected}
        experimentRunning={experimentRunning}
        state={state}
      />
      <mesh castShadow receiveShadow position={[-0.98, 0.95, 0.46]}>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshStandardMaterial color="#38C6A3" emissive="#38C6A3" emissiveIntensity={0.45} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.72, 0.95, 0.46]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.45} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.45, 0.95, 0.46]}>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.45} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.65, 0.93, 0.52]}>
        <boxGeometry args={[0.5, 0.1, 0.14]} />
        <meshStandardMaterial color="#30383B" emissive="#7657C8" emissiveIntensity={0.14} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.95, 0.95, 0.48]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 18]} />
        <meshStandardMaterial color="#B9BEC0" roughness={0.4} metalness={0.25} />
      </mesh>
      <StationLabel text="Main console" active />
    </group>
  );
}

function ControlRack({ state }: { state: WorldState }) {
  const ch02Pulse = state.control.channels["CH-02"] === "transmitting" ? 0.62 : state.control.channels["CH-02"] === "isolated" ? 0.12 : state.control.channels["CH-02"] === "safe" ? 0.18 : 0.06;
  return (
    <group position={[-4.5, 0, 0.5]}>
      <mesh castShadow receiveShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[1.25, 2.0, 1.0]} />
        <meshStandardMaterial color="#252B2D" roughness={0.52} metalness={0.24} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.46, 0.47]}>
        <boxGeometry args={[0.92, 0.38, 0.05]} />
        <meshStandardMaterial color="#30383B" roughness={0.36} metalness={0.4} emissive="#3A8DDE" emissiveIntensity={ch02Pulse} />
      </mesh>
      <mesh position={[0, 1.46, 0.49]}>
        <boxGeometry args={[0.82, 0.26, 0.02]} />
        <meshStandardMaterial color="#ECEDEA" emissive="#3A8DDE" emissiveIntensity={ch02Pulse} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.95, 0.48]}>
        <boxGeometry args={[0.95, 0.18, 0.06]} />
        <meshStandardMaterial color="#30383B" roughness={0.5} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.28, 0.72, 0.48]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 14]} />
        <meshStandardMaterial color="#B9BEC0" roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.0, 0.72, 0.48]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 14]} />
        <meshStandardMaterial color="#d8d8d8" roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.28, 0.72, 0.48]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 14]} />
        <meshStandardMaterial color="#d8d8d8" roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.3, 0.45]}>
        <boxGeometry args={[0.96, 0.28, 0.06]} />
        <meshStandardMaterial color="#ECEDEA" roughness={0.72} metalness={0.02} emissive={state.storyAct === "ANOMALY" ? "#E5A43A" : "#000000"} emissiveIntensity={state.storyAct === "ANOMALY" ? 0.14 : 0} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.04, 0.42]}>
        <boxGeometry args={[1.08, 0.12, 0.08]} />
        <meshStandardMaterial color="#ECEDEA" roughness={0.78} metalness={0.02} />
      </mesh>
      <StationLabel text="Control electronics" />
    </group>
  );
}

function OpticalStation({ aligned, state }: { aligned: boolean; state: WorldState }) {
  return (
    <group position={[-0.2, 0, -2.4]}>
      <mesh castShadow receiveShadow position={[0, 0.95, 0]}>
        <boxGeometry args={[2.7, 1.7, 1.4]} />
        <meshStandardMaterial color="#30383B" roughness={0.42} metalness={0.24} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.72, 1.0, 0.5]}>
        <boxGeometry args={[0.75, 0.3, 0.08]} />
        <meshStandardMaterial color="#252B2D" roughness={0.28} metalness={0.5} emissive="#3A8DDE" emissiveIntensity={0.08} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.72, 1.0, 0.5]}>
        <boxGeometry args={[0.6, 0.14, 0.02]} />
        <meshStandardMaterial color="#ECEDEA" emissive="#3A8DDE" emissiveIntensity={0.12} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.96, 0.68]}>
        <boxGeometry args={[1.55, 0.2, 0.06]} />
        <meshStandardMaterial color="#ECEDEA" emissive="#E5A43A" emissiveIntensity={0.12} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.42, 1.06, -0.52]} rotation={[0, 0, aligned ? 0.45 : 0.1]}>
        <boxGeometry args={[0.24, 0.28, 0.14]} />
        <meshStandardMaterial color="#B9BEC0" roughness={0.36} metalness={0.48} emissive={state.opticalCoupling > 0.95 ? "#38C6A3" : "#000000"} emissiveIntensity={state.opticalCoupling > 0.95 ? 0.08 : 0} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.02, 1.05, -0.3]} rotation={[0, 0, aligned ? -0.35 : -0.12]}>
        <boxGeometry args={[0.18, 0.12, 0.12]} />
        <meshStandardMaterial color="#ECEDEA" roughness={0.2} metalness={0.65} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.9, 0.94, -0.32]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
        <meshStandardMaterial color="#7657C8" emissive="#7657C8" emissiveIntensity={0.12} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.88, 0.58, 0.78]}>
        <cylinderGeometry args={[0.06, 0.06, 0.2, 12]} />
        <meshStandardMaterial color="#ECEDEA" emissive="#3A8DDE" emissiveIntensity={0.08} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.05, 0.0]}>
        <boxGeometry args={[1.9, 0.08, 0.2]} />
        <meshStandardMaterial color="#252B2D" roughness={0.7} metalness={0.15} />
      </mesh>
      <RailLight position={[0, 1.92, 0]} width={1.8} />
      <StationLabel text="Optical control" />
    </group>
  );
}

function ReadoutStation({ armed, experimentRunning, state }: { armed: boolean; experimentRunning: boolean; state: WorldState }) {
  const pulse = experimentRunning ? 0.34 : armed ? 0.2 : 0.08;
  return (
    <group position={[4.4, 0, -1.8]}>
      <mesh castShadow receiveShadow position={[0, 0.98, 0]}>
        <boxGeometry args={[1.8, 2.15, 1.0]} />
        <meshStandardMaterial color="#252B2D" roughness={0.46} metalness={0.22} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.3, 0.48]}>
        <boxGeometry args={[1.25, 0.85, 0.06]} />
        <meshStandardMaterial color="#30383B" roughness={0.22} metalness={0.45} emissive="#3A8DDE" emissiveIntensity={pulse + (state.readout.buffer > 0 ? 0.12 : 0)} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.3, 0.51]}>
        <boxGeometry args={[1.1, 0.58, 0.02]} />
        <meshStandardMaterial color="#ECEDEA" emissive="#E5A43A" emissiveIntensity={pulse * 0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.56, 0.48]}>
        <boxGeometry args={[1.0, 0.18, 0.06]} />
        <meshStandardMaterial color="#30383B" roughness={0.56} metalness={0.2} emissive={armed ? "#38C6A3" : "#000000"} emissiveIntensity={armed ? 0.08 : 0} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.12, 0.45]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 18]} />
        <meshStandardMaterial color="#B9BEC0" roughness={0.4} metalness={0.35} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.34, 0.12, 0.45]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
        <meshStandardMaterial color="#B9BEC0" roughness={0.4} metalness={0.35} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.34, 0.12, 0.45]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
        <meshStandardMaterial color="#B9BEC0" roughness={0.4} metalness={0.35} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.98, -0.62]}>
        <boxGeometry args={[0.92, 0.6, 0.06]} />
        <meshStandardMaterial color="#252B2D" roughness={0.34} metalness={0.34} emissive="#3A8DDE" emissiveIntensity={pulse * 0.3} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.98, -0.66]}>
        <boxGeometry args={[0.8, 0.48, 0.02]} />
        <meshStandardMaterial color="#ECEDEA" emissive="#3A8DDE" emissiveIntensity={pulse * 0.32} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.6, -0.05]}>
        <boxGeometry args={[0.9, 0.1, 0.8]} />
        <meshStandardMaterial color="#ECEDEA" emissive="#7657C8" emissiveIntensity={pulse * 0.35} transparent opacity={0.16} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.0, -0.05]}>
        <boxGeometry args={[1.4, 0.06, 0.92]} />
        <meshStandardMaterial color="#252B2D" roughness={0.7} metalness={0.15} />
      </mesh>
      <RailLight position={[0, 2.04, 0]} width={1.6} />
      <StationLabel text="Readout" />
    </group>
  );
}

function QpuEnclosure({
  doorOpen,
  latchReleased,
  focus,
  experimentRunning,
  state,
}: {
  doorOpen: boolean;
  latchReleased: boolean;
  focus: boolean;
  experimentRunning: boolean;
  state: WorldState;
}) {
  const doorRef = useRef<THREE.Group>(null);
  const latchARef = useRef<THREE.Group>(null);
  const latchBRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);
  const shutterRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const openTarget = doorOpen ? 1 : 0;
    const door = doorRef.current;
    if (door) {
      door.rotation.y = lerp(door.rotation.y, -1.12 * openTarget, delta * 8);
    }

    const latchTarget = latchReleased ? 1 : 0;
    if (latchARef.current) {
      latchARef.current.rotation.z = lerp(latchARef.current.rotation.z, -0.7 * latchTarget, delta * 10);
      latchARef.current.position.x = lerp(latchARef.current.position.x, 1.56 + 0.18 * latchTarget, delta * 10);
    }
    if (latchBRef.current) {
      latchBRef.current.rotation.z = lerp(latchBRef.current.rotation.z, 0.7 * latchTarget, delta * 10);
      latchBRef.current.position.x = lerp(latchBRef.current.position.x, 1.56 + 0.18 * latchTarget, delta * 10);
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y += delta * (experimentRunning ? 0.85 : focus ? 0.45 : 0.16);
    }
    if (shutterRef.current) {
      shutterRef.current.position.z = lerp(shutterRef.current.position.z, doorOpen ? 0.18 : 0.0, delta * 8);
    }
  });

  const warningPulse = state.lightingMode === "critical" ? 0.42 : state.lightingMode === "warning" ? 0.22 : 0.08;
  return (
    <group position={[1.9, 0, 0.1]}>
      <mesh castShadow receiveShadow position={[0, 1.08, 0]}>
        <boxGeometry args={[3.7, 2.15, 2.15]} />
        <meshStandardMaterial color="#101826" roughness={0.42} metalness={0.3} emissive={state.lightingMode === "critical" ? "#ef4444" : "#67e8f9"} emissiveIntensity={warningPulse * 0.12} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.93, 0]}>
        <boxGeometry args={[3.7, 0.16, 2.15]} />
        <meshStandardMaterial color="#1d2738" roughness={0.5} metalness={0.24} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[3.7, 0.18, 2.15]} />
        <meshStandardMaterial color="#1d2738" roughness={0.5} metalness={0.24} />
      </mesh>
      <mesh castShadow receiveShadow position={[-1.78, 1.08, 0]}>
        <boxGeometry args={[0.16, 2.15, 2.15]} />
        <meshStandardMaterial color="#283244" roughness={0.4} metalness={0.28} />
      </mesh>
      <mesh castShadow receiveShadow position={[1.78, 1.08, 0]}>
        <boxGeometry args={[0.16, 2.15, 2.15]} />
        <meshStandardMaterial color="#283244" roughness={0.4} metalness={0.28} />
      </mesh>

      <group ref={doorRef} position={[1.56, 1.02, 1.03]}>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.28, 1.98, 0.12]} />
          <meshStandardMaterial color="#1d2738" roughness={0.34} metalness={0.42} />
        </mesh>
        <mesh castShadow receiveShadow position={[-0.65, 0, -0.02]}>
          <boxGeometry args={[1.4, 1.98, 0.06]} />
          <meshStandardMaterial color="#0b1018" roughness={0.18} metalness={0.34} transparent opacity={0.7} />
        </mesh>
        <mesh castShadow receiveShadow position={[-0.1, 0.32, -0.03]}>
          <boxGeometry args={[0.96, 0.28, 0.02]} />
          <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.1} transparent opacity={0.26} />
        </mesh>
        <group ref={latchARef} position={[0.56, 0.7, 0.09]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.34, 0.08, 0.12]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.55} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.16, 14]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.32} metalness={0.45} />
          </mesh>
        </group>
        <group ref={latchBRef} position={[0.56, 1.35, 0.09]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.34, 0.08, 0.12]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.55} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.16, 14]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.32} metalness={0.45} />
          </mesh>
        </group>
      </group>

      <group ref={shutterRef} position={[-0.15, 1.08, 0]}>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.88, 0.88, 1.2, 32, 1, true]} />
          <meshStandardMaterial color="#0d1320" roughness={0.3} metalness={0.42} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0, 0.52]}>
          <cylinderGeometry args={[0.56, 0.56, 1.0, 24, 1, true]} />
          <meshStandardMaterial color="#111827" roughness={0.34} metalness={0.34} />
        </mesh>
        <group ref={innerRingRef} position={[0, 0, 0]}>
          <mesh castShadow receiveShadow>
            <torusGeometry args={[0.78, 0.035, 12, 48]} />
            <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={0.34} transparent opacity={0.82} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0, 0.38]}>
            <torusGeometry args={[0.5, 0.03, 12, 48]} />
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.28} transparent opacity={0.8} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0, -0.12]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#e0f2fe" emissive="#67e8f9" emissiveIntensity={0.72} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, -0.4, 0]}>
            <boxGeometry args={[0.06, 0.6, 0.06]} />
            <meshStandardMaterial color="#dbeafe" emissive="#67e8f9" emissiveIntensity={0.1} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.42, 0.02, 0]}>
            <boxGeometry args={[0.2, 0.05, 0.28]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.34} metalness={0.5} />
          </mesh>
          <mesh castShadow receiveShadow position={[-0.42, -0.02, 0]}>
            <boxGeometry args={[0.2, 0.05, 0.28]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.34} metalness={0.5} />
          </mesh>
        </group>
      </group>

      <mesh castShadow receiveShadow position={[0, 0.82, -0.55]}>
        <boxGeometry args={[2.6, 0.16, 0.16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.52} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.5, -0.55]}>
        <boxGeometry args={[2.6, 0.12, 0.12]} />
        <meshStandardMaterial color="#1f2937" roughness={0.52} metalness={0.18} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.16, -0.53]}>
        <boxGeometry args={[0.86, 1.0, 0.08]} />
        <meshStandardMaterial color="#09111b" roughness={0.24} metalness={0.28} emissive="#67e8f9" emissiveIntensity={0.08} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.16, -0.49]}>
        <boxGeometry args={[0.72, 0.78, 0.02]} />
        <meshStandardMaterial color="#dbeafe" emissive={state.lightingMode === "critical" ? "#ef4444" : "#67e8f9"} emissiveIntensity={experimentRunning ? 0.24 : 0.1 + warningPulse * 0.35} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.1, 0.5, -0.05]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 12]} />
        <meshStandardMaterial color="#67e8f9" emissive={state.lightingMode === "critical" ? "#ef4444" : "#67e8f9"} emissiveIntensity={warningPulse * 0.25} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.1, 0.58, 0.06]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 12]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={warningPulse * 0.22} />
      </mesh>
      <StationLabel text="QPU enclosure" active={focus || doorOpen} />
    </group>
  );
}

function LabRoom({
  player,
  yaw,
  pitch,
  jumpHeight,
  state,
  nearest,
  cameraMode,
}: {
  player: Vec2;
  yaw: number;
  pitch: number;
  jumpHeight: number;
  state: WorldState;
  nearest: { station: StationSpec | null; proximity: Proximity; ready: boolean };
  cameraMode: CameraMode;
}) {
  const roofLights = useMemo(
    () => [
      [-5.0, 3.45, 3.0] as [number, number, number],
      [5.0, 3.45, -3.0] as [number, number, number],
    ],
    []
  );
  const isCritical = state.lightingMode === "critical";
  const isWarning = state.lightingMode === "warning";

  return (
    <>
      <color attach="background" args={[isCritical ? "#150a0a" : isWarning ? "#171009" : "#050a14"]} />
      <fog attach="fog" args={[isCritical ? "#150a0a" : isWarning ? "#171009" : "#050a14", 10, 26]} />
      <ambientLight intensity={isCritical ? 0.38 : isWarning ? 0.4 : 0.36} color={isCritical ? "#ffb4b4" : "#94a3b8"} />
      <hemisphereLight intensity={isCritical ? 0.34 : 0.4} color={isCritical ? "#ffb4b4" : "#7dd3fc"} groundColor="#0f172a" />
      <directionalLight position={[5, 8, 6]} intensity={isCritical ? 0.65 : 0.55} color={isCritical ? "#ffb4b4" : "#dbeafe"} castShadow />
      <directionalLight position={[-6, 5, -4]} intensity={isCritical ? 0.45 : 0.38} color={isCritical ? "#ef4444" : "#8B5CF6"} />
      <pointLight position={[2.2, 1.7, 0.15]} intensity={isCritical ? 0.6 : 2.2} distance={7} color={isCritical ? "#ef4444" : "#38C6A3"} />
      <pointLight position={[-3.8, 1.9, 3.0]} intensity={1.3} distance={6} color="#3A8DDE" />
      <pointLight position={[4.4, 1.7, -1.7]} intensity={1.0} distance={5} color="#E5A43A" />

      <CameraRig player={player} yaw={yaw} pitch={pitch} jumpHeight={jumpHeight} focus={state.focus} cameraMode={cameraMode} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color="#101b2c" roughness={0.85} metalness={0.15} />
      </mesh>

      <gridHelper args={[24, 48, isCritical ? "#b91c1c" : "#334155", isCritical ? "#5c1f1f" : "#1e293b"]} position={[0, 0.02, 0]} />

      <mesh position={[0, ROOM.height / 2, -ROOM.depth / 2]} receiveShadow>
        <boxGeometry args={[ROOM.width, ROOM.height, WALL_THICKNESS]} />
        <meshStandardMaterial color="#131f30" roughness={0.78} metalness={0.18} />
      </mesh>
      <mesh position={[0, ROOM.height / 2, ROOM.depth / 2]} receiveShadow>
        <boxGeometry args={[ROOM.width, ROOM.height, WALL_THICKNESS]} />
        <meshStandardMaterial color="#131f30" roughness={0.78} metalness={0.18} />
      </mesh>
      <mesh position={[-ROOM.width / 2, ROOM.height / 2, 0]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, ROOM.height, ROOM.depth]} />
        <meshStandardMaterial color="#131f30" roughness={0.78} metalness={0.18} />
      </mesh>
      <mesh position={[ROOM.width / 2, ROOM.height / 2, 0]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, ROOM.height, ROOM.depth]} />
        <meshStandardMaterial color="#131f30" roughness={0.78} metalness={0.18} />
      </mesh>

      <mesh position={[0, ROOM.height - 0.08, 0]} receiveShadow>
        <boxGeometry args={[ROOM.width - 0.5, 0.08, ROOM.depth - 0.5]} />
        <meshStandardMaterial color="#060c16" roughness={0.9} metalness={0.1} />
      </mesh>

      {roofLights.map((position) => (
        <group key={position.join(",")} position={position}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.08, 0.26]} />
            <meshStandardMaterial color="#e2e8f0" emissive="#bae6fd" emissiveIntensity={0.9} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 3.0, 0]} receiveShadow>
        <boxGeometry args={[12.8, 0.06, 0.14]} />
        <meshStandardMaterial color="#dbeafe" emissive="#38C6A3" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0.16, 0]} receiveShadow>
        <boxGeometry args={[ROOM.width - 1.2, 0.02, ROOM.depth - 1.1]} />
        <meshStandardMaterial color="#0a121c" roughness={0.88} metalness={0.12} />
      </mesh>

      <MainConsole
        tested={state.systemTested}
        experimentSelected={state.experimentSelected}
        experimentRunning={state.experimentRunning}
        state={state}
      />
      <ControlRack state={state} />
      <OpticalStation aligned={state.opticalAligned} state={state} />
      <QpuEnclosure
        doorOpen={state.qpuDoorOpen}
        latchReleased={state.qpuLatchReleased}
        focus={state.focus === "qpu"}
        experimentRunning={state.experimentRunning}
        state={state}
      />
      <ReadoutStation armed={state.readoutArmed} experimentRunning={state.experimentRunning} state={state} />

      <group position={[0, 1.0, 0]}>
        {STATIONS.map((station) => {
          const show = distance2(player, station.position) < 4.2;
          const ready = nearest.station?.id === station.id && nearest.ready;
          const focused = state.focus === station.id;
          if (!show && !focused) return null;
          return (
            <group key={station.id} position={[station.position.x, 2.05, station.position.z]}>
              <StationLabel text={focused ? `${station.name}  [R] EXIT` : ready ? `${station.name}  [E] INSPECT` : station.name} active={ready || focused} />
            </group>
          );
        })}
      </group>

      <Html center position={[0, 4.4, -1.0]}>
        <div className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-black/55 backdrop-blur-sm">
          {state.focus ? `Inspecting ${nearest.station?.name ?? "station"}` : "First-person lab foundation"}
        </div>
      </Html>
    </>
  );
}

function StatusPanel({
  state,
  nearest,
  enteredLab,
  onToggleOverview,
  onReset,
  onEnterLab,
  onGoToConsole,
  onGoToQpu,
  onOpenQpu,
  onCloseQpu,
  onSystemTest,
  onRunCalibration,
  onRunBell,
  onRunSystemDiagnostics,
  onAbortAllJobs,
  onIsolateCh02,
  onEnterSafeMode,
  onToggleWhy,
  onNudgeCalibration,
  onLockCalibration,
  onAdjustOptical,
  onLockOptical,
  onCycleTutorialMode,
  onCycleCameraMode,
  onRunShots,
  onBeginBellTask,
  onMarkBellHadamard,
  onMarkBellCnot,
  onVerifyBellControl,
  onInspectBellQpu,
  onQueueBellExperiment,
  onAdvanceBellQuiz,
  onAnswerBellQuiz,
}: {
  state: WorldState;
  nearest: { station: StationSpec | null; proximity: Proximity; ready: boolean };
  enteredLab: boolean;
  onToggleOverview: () => void;
  onReset: () => void;
  onEnterLab: () => void;
  onGoToConsole: () => void;
  onGoToQpu: () => void;
  onOpenQpu: () => void;
  onCloseQpu: () => void;
  onSystemTest: () => void;
  onRunCalibration: () => void;
  onRunBell: () => void;
  onRunSystemDiagnostics: () => void;
  onAbortAllJobs: () => void;
  onIsolateCh02: () => void;
  onEnterSafeMode: () => void;
  onToggleWhy: () => void;
  onNudgeCalibration: (delta: number) => void;
  onLockCalibration: () => void;
  onAdjustOptical: (deltaYaw: number, deltaPitch: number) => void;
  onLockOptical: () => void;
  onCycleTutorialMode: () => void;
  onCycleCameraMode: () => void;
  onRunShots: () => void;
  onBeginBellTask: () => void;
  onMarkBellHadamard: () => void;
  onMarkBellCnot: () => void;
  onVerifyBellControl: () => void;
  onInspectBellQpu: () => void;
  onQueueBellExperiment: () => void;
  onAdvanceBellQuiz: () => void;
  onAnswerBellQuiz: (choice: "A" | "B" | "C") => void;
}) {
  const current = nearest.station;
  const guide = current ? STATION_GUIDES[current.id] : STATION_GUIDES.console;
  const helper = state.focus
    ? state.focus === "qpu"
      ? "This enclosure protects the ion-trap processor."
      : current?.description ?? "Inspect the station to learn what it does."
    : current?.description ?? "Walk toward the machine to reveal a station label.";
  const bellMission = getBellMissionStep(state.bellTask);
  const bellReady = state.systemTested && state.opticalAligned && state.qpuDoorOpen;

  const mission =
    current?.id === "console"
      ? {
          title: "Control desk mission",
          steps: ["Approach the console", "Run the system test", "Confirm CONTROL online"],
        }
      : current?.id === "control"
        ? {
            title: "Timing rack mission",
            steps: ["Move beside the rack", "Inspect the electronics", "Hold position to stabilize"],
          }
        : current?.id === "optical"
          ? {
              title: "Optical mission",
              steps: ["Approach the laser enclosure", "Align the optics", "Verify beam alignment"],
            }
          : current?.id === "qpu"
            ? {
                title: "QPU mission",
                steps: ["Open the service panel", "Release the latch", "Inspect the processor"],
              }
            : current?.id === "readout"
              ? {
                  title: "Readout mission",
                  steps: ["Approach the detector stack", "Arm the readout", "Confirm data path"],
                }
              : {
                  title: "Mission brief",
                steps: ["Move to a station", "Interact with E", "Complete the station task"],
                };
  const tutorialLabel =
    state.tutorialMode === "guided" ? "Guided" : state.tutorialMode === "standard" ? "Standard" : "Explorer";
  const cameraLabel =
    state.cameraMode === "walk" ? "Walk" : state.cameraMode === "overview" ? "Overview" : "Macro";
  const bellRate = state.bellShots > 0 ? Math.round(((state.bellHistogram.zeroZero + state.bellHistogram.oneOne) / Math.max(1, state.bellShots)) * 100) : 0;
  const missionStep = getMissionStep(state, enteredLab);

  return (
    <div className="rounded-[30px] border border-white/10 bg-[#0b1018] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.36)]">
      <div className="flex items-center gap-2 text-sm text-white/60">
        <Sparkles size={15} className="text-cyan-200/80" />
        Lab status
      </div>
      <div className="mt-4 space-y-3">
        {state.storyAct !== "NORMAL" && state.storyAct !== "RECOVERED" && (
          <div className={`rounded-2xl border p-4 ${state.lightingMode === "critical" ? "border-red-300/30 bg-red-500/10" : "border-cyan-300/20 bg-cyan-300/10"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/52">Emergency HUD</p>
                <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-white">{state.storyAct === "ANOMALY" ? "QPU thermal instability" : state.storyAct === "DIAGNOSIS" ? "Diagnosis in progress" : state.storyAct === "STABILIZING" ? "Stabilizing cryogenics" : state.storyAct === "CALIBRATION" ? "Recalibrating control chain" : "Recovery validation"}</p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  TEMP {state.qpuTemperatureMk.toFixed(1)} mK | COOLING {state.cryogenics.heatLoad.toUpperCase()} | CH-02 {state.control.channels["CH-02"].toUpperCase()}
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/72">
                {state.lightingMode.toUpperCase()}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <ToolButton icon={Shield} label="Run diagnostics" onClick={onRunSystemDiagnostics} active />
              <ToolButton icon={ToggleLeft} label="Abort all" onClick={onAbortAllJobs} />
              <ToolButton icon={ToggleLeft} label="Isolate CH-02" onClick={onIsolateCh02} />
              <ToolButton icon={ToggleLeft} label="QPU safe mode" onClick={onEnterSafeMode} />
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-300/10 via-white/5 to-purple-300/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">{missionStep.label}</p>
              <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-white">{missionStep.title}</p>
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/70">
              {missionStep.progressLabel}
            </div>
          </div>
          <p className="mt-2 text-sm leading-6 text-white/72">{missionStep.detail}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full border border-white/10 bg-black/25">
            <div className="h-full bg-gradient-to-r from-[#3A8DDE] via-[#38C6A3] to-[#7657C8]" style={{ width: `${missionStep.progressValue}%` }} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">Layer 1 Objective</p>
          <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-white">{guide.objective}</p>
          <p className="mt-2 text-sm leading-6 text-white/68">{current ? current.prompt : "Enter the lab and move to a station."}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">Layer 2 Controls</p>
          <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-white">{current?.name ?? "Entrance corridor"}</p>
          <p className="mt-2 text-sm leading-6 text-white/68">{guide.howTo}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.24em] text-white/52">
            <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1">E interact</span>
            <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1">R exit</span>
            <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1">Tab overview</span>
            <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1">Mouse look</span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">Layer 3 Why does this matter?</p>
            <button
              type="button"
              onClick={onToggleWhy}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/72 transition hover:border-white/20 hover:bg-white/10"
            >
              {state.whyOpen ? "Hide" : "Show"}
            </button>
          </div>
          <p className="mt-2 text-sm leading-6 text-white/68">{guide.why}</p>
          {state.whyOpen && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-3 text-sm leading-6 text-white/68">
              <p>{helper}</p>
              <p className="mt-2 text-cyan-100/80">
                {state.focus === "qpu"
                  ? "Simplified visualization for educational purposes."
                  : "The physical room and the conceptual quantum flow are intentionally shown together."}
              </p>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">{mission.title}</p>
          <div className="mt-2 space-y-2 text-sm leading-6 text-white/78">
            {mission.steps.map((step, index) => (
              <div key={step} className="flex items-start gap-2">
                <span className="mt-0.5 text-white/45">{index + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
        {current?.id === "console" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">Timing control</p>
              <p className="mt-2 text-sm leading-6 text-white/68">Offset {state.calibrationOffset.toFixed(2)} ns | Target near 0.00 ns</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => onNudgeCalibration(-0.02)} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/74">Offset -</button>
                <button type="button" onClick={() => onNudgeCalibration(0.02)} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/74">Offset +</button>
                <button type="button" onClick={onLockCalibration} className="rounded-full border border-[#38C6A3]/30 bg-[#38C6A3]/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#222829]">Lock sync</button>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full border border-white/10 bg-black/25">
                <div className="h-full bg-[#3A8DDE]" style={{ width: `${Math.max(4, 100 - Math.abs(state.calibrationOffset) * 180)}%` }} />
              </div>
            </div>
            {(state.bellTask.step === "BUILD_H" || state.bellTask.step === "BUILD_CNOT") && (
              <div className="rounded-2xl border border-white/10 bg-[#ECEDEA]/92 p-4 text-[#222829]">
                <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#7657C8]/80">Bell circuit</p>
                <p className="mt-2 text-sm leading-6 text-[#30383B]/82">
                  {state.bellTask.step === "BUILD_H"
                    ? "Place a Hadamard on q0 to create superposition."
                    : "Place CNOT from q0 to q1 to entangle the pair."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {state.bellTask.step === "BUILD_H" ? (
                    <button type="button" onClick={onMarkBellHadamard} className="rounded-full border border-[#38C6A3]/30 bg-[#38C6A3]/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#222829]">Place H on q0</button>
                  ) : (
                    <>
                      <button type="button" onClick={onMarkBellCnot} className="rounded-full border border-[#38C6A3]/30 bg-[#38C6A3]/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#222829]">Place CNOT q0 → q1</button>
                      <button type="button" onClick={onVerifyBellControl} className="rounded-full border border-[#7657C8]/30 bg-[#7657C8]/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#222829]">Verify control</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {current?.id === "optical" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">Optical control</p>
            <p className="mt-2 text-sm leading-6 text-white/68">
              Yaw {state.opticalYaw.toFixed(2)}° | Pitch {state.opticalPitch.toFixed(2)}° | Coupling {Math.round(state.opticalCoupling * 100)}%
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => onAdjustOptical(-0.05, 0)} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/74">Yaw -</button>
              <button type="button" onClick={() => onAdjustOptical(0.05, 0)} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/74">Yaw +</button>
              <button type="button" onClick={() => onAdjustOptical(0, -0.04)} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/74">Pitch -</button>
              <button type="button" onClick={() => onAdjustOptical(0, 0.04)} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/74">Pitch +</button>
              <button type="button" onClick={onLockOptical} className="rounded-full border border-[#38C6A3]/30 bg-[#38C6A3]/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#222829]">Lock alignment</button>
            </div>
          </div>
        )}
        {current?.id === "qpu" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">QPU control</p>
            <p className="mt-2 text-sm leading-6 text-white/68">{state.qpuDoorOpen ? "Door open. You can inspect the interior." : "Release the latch and open the enclosure."}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ToolButton icon={ToggleLeft} label={state.qpuDoorOpen ? "Close QPU" : "Open QPU"} onClick={state.qpuDoorOpen ? onCloseQpu : onOpenQpu} active={state.qpuDoorOpen} />
            </div>
          </div>
        )}
        {current?.id === "readout" && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">Readout</p>
            <p className="mt-2 text-sm leading-6 text-white/68">
              {state.bellTask.results.counts
                ? "The measurement histogram is ready to inspect."
                : "Run the Bell job from the console to generate readout data."}
            </p>
            {state.bellTask.results.counts ? (
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <MiniStat label="00" value={`${state.bellTask.results.counts["00"]}`} active />
                <MiniStat label="01" value={`${state.bellTask.results.counts["01"]}`} />
                <MiniStat label="10" value={`${state.bellTask.results.counts["10"]}`} />
                <MiniStat label="11" value={`${state.bellTask.results.counts["11"]}`} active />
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-white/68">
                No measurement data yet.
              </div>
            )}
            {state.bellTask.step === "ANALYZE_RESULTS" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <ToolButton icon={PlayCircle} label="Continue to quiz" onClick={onAdvanceBellQuiz} active />
              </div>
            )}
          </div>
        )}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">Tutorial / Camera</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onCycleTutorialMode} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/74">
                {tutorialLabel}
              </button>
              <button type="button" onClick={onCycleCameraMode} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/74">
                {cameraLabel}
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm leading-6 text-white/68">
            {state.tutorialMode === "guided"
              ? "Guided shows objectives, controls, why notes, and the queue."
              : state.tutorialMode === "standard"
                ? "Standard keeps the objective and controls, with optional explanations."
                : "Explorer keeps the UI lighter and only surfaces essential prompts."}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <MiniStat label="Control" value={state.systemTested ? "ONLINE" : "STANDBY"} active={state.systemTested} />
          <MiniStat label="Optical" value={state.opticalAligned ? "ALIGNED" : `COUPLING ${Math.round(state.opticalCoupling * 100)}%`} active={state.opticalAligned} />
          <MiniStat label="Vacuum" value="NOMINAL" active />
          <MiniStat label="QPU" value={state.qpuDoorOpen ? "OPEN" : "SEALED"} active={state.qpuDoorOpen} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">Bell task flow</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">{missionStep.progressLabel}</p>
          </div>
          <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-white">{missionStep.title}</p>
          <p className="mt-2 text-sm leading-6 text-white/68">{missionStep.detail}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full border border-white/10 bg-black/25">
            <div className="h-full bg-gradient-to-r from-[#3A8DDE] via-[#38C6A3] to-[#7657C8]" style={{ width: `${missionStep.progressValue}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {state.bellTask.step === "GO_TO_CONSOLE" && <ToolButton icon={ArrowRight} label="Begin Bell task" onClick={onBeginBellTask} active />}
            {state.bellTask.step === "BUILD_H" && <ToolButton icon={Cpu} label="Place H on q0" onClick={onMarkBellHadamard} active />}
            {state.bellTask.step === "BUILD_CNOT" && <ToolButton icon={Cpu} label="Place CNOT q0 → q1" onClick={onMarkBellCnot} active />}
            {state.bellTask.step === "VERIFY_CONTROL" && <ToolButton icon={Shield} label="Run signal check" onClick={onVerifyBellControl} active />}
            {state.bellTask.step === "OPEN_QPU" && <ToolButton icon={ToggleLeft} label={state.qpuDoorOpen ? "Inspect QPU" : "Open QPU"} onClick={onInspectBellQpu} active={state.qpuDoorOpen} />}
            {state.bellTask.step === "QUEUE_EXPERIMENT" && <ToolButton icon={Waves} label="Queue Bell experiment" onClick={onQueueBellExperiment} active />}
            {state.bellTask.step === "ANALYZE_RESULTS" && <ToolButton icon={PlayCircle} label="Continue to quiz" onClick={onAdvanceBellQuiz} active />}
            {state.bellTask.step === "QUIZ" && (
              <>
                <ToolButton icon={Shield} label="A. Independent" onClick={() => onAnswerBellQuiz("A")} />
                <ToolButton icon={Shield} label="B. Correlated" onClick={() => onAnswerBellQuiz("B")} />
                <ToolButton icon={Shield} label="C. Always 00" onClick={() => onAnswerBellQuiz("C")} />
              </>
            )}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {missionStep.checklist.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/18 px-3 py-2 text-sm text-white/74">
                {item}
              </div>
            ))}
          </div>
          {state.bellTask.results.counts && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">Bell results</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">{state.bellTask.results.shots} shots</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <MiniStat label="00" value={`${state.bellTask.results.counts["00"]}`} active />
                <MiniStat label="01" value={`${state.bellTask.results.counts["01"]}`} />
                <MiniStat label="10" value={`${state.bellTask.results.counts["10"]}`} />
                <MiniStat label="11" value={`${state.bellTask.results.counts["11"]}`} active />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/68">
                Strong 00 / 11 correlations are consistent with the expected Bell-state pattern.
              </p>
            </div>
          )}
          {state.bellTask.completed && (
            <div className="mt-4 rounded-2xl border border-[#38C6A3]/30 bg-[#38C6A3]/10 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#38C6A3]">Task complete</p>
              <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-white">Bell state prepared</p>
              <p className="mt-2 text-sm leading-6 text-white/72">
                You built the Bell circuit, ran the hardware pipeline, observed correlated shots, and answered the concept check.
              </p>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">Experiment queue</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">{bellReady ? "Bell ready" : "Prep chain"}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <ToolButton icon={Cpu} label={state.experimentSelected === "calibration" ? "Calibration running" : "Calibration"} onClick={onRunCalibration} active={state.experimentSelected === "calibration"} />
            <ToolButton icon={Waves} label={bellReady ? (state.experimentSelected === "bell" ? "Bell running" : "Bell state") : "Bell state locked"} onClick={onRunBell} active={state.experimentSelected === "bell"} />
            <ToolButton icon={ToggleLeft} label="Run shots" onClick={onRunShots} active={state.experimentSelected === "bell" && state.experimentRunning} />
          </div>
          <p className="mt-3 text-sm leading-6 text-white/68">
            {bellReady
              ? "The lab is ready for entanglement and readout."
              : "Run the diagnostic, align optics, and open the QPU before the Bell experiment becomes available."}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.24em] text-white/44">
            Recovery focus: {bellMission.title}
          </p>
          {state.experimentSelected === "bell" && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-white/48">
                <span>Shots</span>
                <span>{state.bellShots}/64</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <MiniStat label="00" value={`${state.bellHistogram.zeroZero}`} active />
                <MiniStat label="11" value={`${state.bellHistogram.oneOne}`} active />
                <MiniStat label="Other" value={`${state.bellHistogram.other}`} />
              </div>
              <p className="mt-2 text-sm leading-6 text-white/64">Correlated outcomes: {bellRate}%</p>
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">System log</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">{state.mystery.unknownJobVisible ? "1 unresolved" : "monitoring"}</p>
          </div>
          <div className="mt-3 space-y-2">
            {state.logs.slice(-4).map((entry) => (
              <div key={`${entry.time}-${entry.message}`} className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-sm leading-6 text-white/70">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">{entry.time}</span>
                <span className="ml-2">{entry.message}</span>
              </div>
            ))}
            {state.mystery.unknownJobVisible && (
              <div className="rounded-2xl border border-[#38C6A3]/20 bg-[#38C6A3]/10 px-3 py-2 text-sm leading-6 text-white/78">
                Unknown job {state.mystery.unknownJobId} remains in the log.
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">Glossary</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {GLOSSARY.map((item) => (
              <div key={item.term} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                <p className="text-sm font-medium text-white">{item.term}</p>
                <p className="mt-1 text-sm leading-6 text-white/64">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ToolButton icon={ArrowRight} label="Enter lab" onClick={onEnterLab} active />
        <ToolButton icon={Shield} label="Console" onClick={onGoToConsole} />
        <ToolButton icon={Waves} label="QPU" onClick={onGoToQpu} />
        <ToolButton icon={ToggleLeft} label="Open QPU" onClick={onOpenQpu} active={state.qpuDoorOpen} />
        <ToolButton icon={Cpu} label="System test" onClick={onSystemTest} active={state.systemTested} />
        <ToolButton icon={ScanSearch} label={state.overviewOpen ? "Hide overview" : "System overview"} onClick={onToggleOverview} active={state.overviewOpen} />
        <ToolButton icon={RotateCcw} label="Reset view" onClick={onReset} />
        <Link
          to="/#explore-research"
          className="inline-flex items-center gap-2 rounded-full border border-[#7657C8]/30 bg-[#7657C8]/12 px-4 py-2 text-sm text-white transition hover:border-[#7657C8]/50 hover:bg-[#7657C8]/18"
        >
          <ArrowRight size={14} />
          Explore research
        </Link>
      </div>

      <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm leading-6 text-white/68">
        <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/42">Controls</p>
        <p className="mt-2">WASD move. Mouse look. Space jump. E interact. R exit inspect. Tab overview. Esc pause.</p>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className={`rounded-2xl border px-3 py-3 ${active ? "border-cyan-300/20 bg-cyan-300/10" : "border-white/10 bg-white/5"}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: ComponentType<any>;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-cyan-300/22 bg-cyan-300/12 text-cyan-50"
          : "border-white/10 bg-white/5 text-white/84 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function OverviewOverlay({
  open,
  state,
}: {
  open: boolean;
  state: WorldState;
}) {
  const items = [
    ["CONTROL CONSOLE", state.systemTested ? "ONLINE" : "STANDBY"],
    ["OPTICAL / LASER", state.opticalAligned ? "ALIGNED" : "DEGRADED"],
    ["VACUUM / QPU", state.qpuDoorOpen ? "OPEN" : "SEALED"],
    ["READOUT", state.readoutArmed ? "READY" : "STANDBY"],
    [
      "EXPERIMENT",
      state.experimentRunning
        ? `${(state.experimentSelected ?? "CALIBRATION").toUpperCase()} RUNNING`
        : state.experimentSelected
          ? state.experimentSelected.toUpperCase()
          : "IDLE",
    ],
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="pointer-events-none absolute left-4 top-4 z-20 max-w-md rounded-[24px] border border-white/10 bg-black/55 p-4 backdrop-blur-md"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-cyan-200/70">Conceptual system overview</p>
          <div className="mt-3 space-y-2">
            {items.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
                <span className="text-sm text-white/82">{label}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-white/64">This is the whole machine, not a slideshow.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getMissionStep(state: WorldState, enteredLab: boolean) {
  const temp = `${state.qpuTemperatureMk.toFixed(1)} mK`;
  const stepMap: Record<StoryAct, { label: string; title: string; detail: string; progressLabel: string; progressValue: number; checklist: string[] }> = {
    NORMAL: {
      label: "ACT 0",
      title: enteredLab ? "Normal entry" : "Enter the lab",
      detail: "Walk the room and keep an eye on the baseline telemetry.",
      progressLabel: "READY",
      progressValue: 10,
      checklist: ["Observe the room", "Approach the machine", "Watch baseline telemetry"],
    },
    ANOMALY: {
      label: "ACT 1",
      title: "Thermal anomaly",
      detail: `QPU thermal drift detected. Temperature ${temp}.`,
      progressLabel: "WARNING",
      progressValue: 22,
      checklist: ["Notice the warning", "Open the dashboard", "Find the heat source"],
    },
    DIAGNOSIS: {
      label: "ACT 2",
      title: "Diagnosis",
      detail: "Inspect the cryostat and control electronics for the source of heat load.",
      progressLabel: "SCANNING",
      progressValue: 34,
      checklist: ["Inspect QPU", "Inspect control rack", "Read the logs"],
    },
    EMERGENCY_RESPONSE: {
      label: "ACT 3",
      title: "Emergency response",
      detail: "Choose how to remove the fault and protect the QPU.",
      progressLabel: "ACTION",
      progressValue: 46,
      checklist: ["Abort all", "Isolate CH-02", "Enter safe mode"],
    },
    STABILIZING: {
      label: "ACT 4",
      title: "Stabilization",
      detail: `Cooling is recovering. Current mixing chamber ${temp}.`,
      progressLabel: "COOLING",
      progressValue: 58,
      checklist: ["Watch temperature fall", "Wait for stable cooling", "Confirm heat load normal"],
    },
    RECOVERY_CHECK: {
      label: "ACT 5",
      title: "Recovery check",
      detail: "Thermal excursion ended. Calibration is no longer trustworthy.",
      progressLabel: "CHECK",
      progressValue: 68,
      checklist: ["Recalibrate", "Inspect logs", "Prepare Bell validation"],
    },
    CALIBRATION: {
      label: "ACT 6",
      title: "Calibration",
      detail: "Recalibrate the control chain before you trust the machine again.",
      progressLabel: state.calibrationState === "running" ? "RUNNING" : "READY",
      progressValue: 78,
      checklist: ["Run calibration", "Lock sync", "Validate control"],
    },
    VALIDATION: {
      label: "ACT 7",
      title: "Bell validation",
      detail: "Build the Bell circuit and validate the recovered QPU with repeated shots.",
      progressLabel: state.qpuValidated ? "PASSED" : "RUNNING",
      progressValue: 88,
      checklist: ["Build H + CNOT", "Run 1024 shots", "Check 00 / 11 correlation"],
    },
    RECOVERED: {
      label: "ACT 8",
      title: "System restored",
      detail: "The QPU is back online and the machine has been validated.",
      progressLabel: "RESTORED",
      progressValue: 100,
      checklist: ["QPU online", "Control calibrated", "Bell validation passed"],
    },
    MYSTERY: {
      label: "LOG",
      title: "Unresolved event",
      detail: "An unknown pulse job remains in the system log.",
      progressLabel: "HOOK",
      progressValue: 100,
      checklist: ["Review job #8393", "Trace CH-02", "Leave the mystery for later"],
    },
  };
  return stepMap[state.storyAct];
}

export default function Lab01FirstPersonPage() {
  const reduceMotion = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const velocityRef = useRef<Vec2>({ x: 0, z: 0 });
  const lookVelocityRef = useRef({ x: 0, y: 0 });
  const turnRef = useRef({ left: false, right: false });
  const dragRef = useRef({ active: false, pointerId: -1, lastX: 0, lastY: 0 });
  const jumpRef = useRef({ height: 0, velocity: 0 });
  const playerRef = useRef<Vec2>({ x: 0, z: 3.45 });
  const lookRef = useRef({ x: 0, y: -0.04 });
  const focusRef = useRef<FocusId>(null);
  const enteredAtRef = useRef<number | null>(null);
  const storyStartedRef = useRef(false);
  const eventFlagsRef = useRef({
    warningLogged: false,
    criticalLogged: false,
    recoveryLogged: false,
    shutdownLogged: false,
    calibrationLogged: false,
  });

  const [player, setPlayer] = useState<Vec2>(playerRef.current);
  const [look, setLook] = useState(lookRef.current);
  const [jumpHeight, setJumpHeight] = useState(0);
  const [state, setState] = useState<WorldState>(() => loadWorldState());
  const [introVisible, setIntroVisible] = useState(true);
  const [bootLine, setBootLine] = useState("SYSTEM ACCESS GRANTED");
  const [enteredLab, setEnteredLab] = useState(false);
  const [fullscreenLocked, setFullscreenLocked] = useState(false);
  const fullscreenPendingRef = useRef(false);

  const yaw = look.x;
  const pitch = clamp(look.y, -0.45, 0.35);

  const nearest = useMemo(() => {
    let station: StationSpec | null = null;
    let best = Infinity;
    for (const item of STATIONS) {
      const d = distance2(player, item.position);
      if (d < best) {
        best = d;
        station = item;
      }
    }
    const ready = !!station && best < 1.05 && nearlyFacing(player, yaw, station);
    let proximity: Proximity = "far";
    if (best < 0.95) proximity = "ready";
    else if (best < 3.2) proximity = "discover";
    if (state.focus) proximity = "focused";
    return { station, proximity, ready };
  }, [player, state.focus, yaw]);

  useEffect(() => {
    const bootTimer = window.setTimeout(() => setBootLine("APPROACH THE MACHINE"), reduceMotion ? 0 : 900);
    const introTimer = window.setTimeout(() => setIntroVisible(false), reduceMotion ? 0 : 2200);
    return () => {
      window.clearTimeout(bootTimer);
      window.clearTimeout(introTimer);
    };
  }, [reduceMotion]);

  useEffect(() => {
    focusRef.current = state.focus;
  }, [state.focus]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(BELL_TASK_STORAGE_KEY, JSON.stringify(state.bellTask));
    window.dispatchEvent(new Event("mrama:lab-learning"));
  }, [state.bellTask]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(EMERGENCY_STATE_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!enteredLab || storyStartedRef.current) return;
    enteredAtRef.current = performance.now();
    const timer = window.setTimeout(() => {
      startThermalAnomaly();
      storyStartedRef.current = true;
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [enteredLab]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.06, (now - last) / 1000);
      last = now;
      setState((current) => {
        const next = { ...current };
        const heating = current.storyAct === "ANOMALY" || current.storyAct === "DIAGNOSIS" || current.storyAct === "EMERGENCY_RESPONSE";
        const cooling = current.storyAct === "STABILIZING" || current.storyAct === "RECOVERY_CHECK" || current.storyAct === "CALIBRATION" || current.storyAct === "VALIDATION" || current.storyAct === "RECOVERED";
        const responseActive = current.emergencyResponse !== null;
        const targetTemp = cooling || responseActive ? 16.2 : current.qpuTargetTemperatureMk;
        let temperature = current.qpuTemperatureMk;

        if (heating && !responseActive) {
          temperature = clamp(temperature + dt * 5.1, 15.4, 41.7);
        } else {
          const coolRate = current.emergencyResponse === "safe-mode" ? 6.5 : current.emergencyResponse === "abort-all" ? 5.2 : 4.4;
          temperature = lerp(temperature, targetTemp, 1 - Math.exp(-coolRate * dt));
        }

        const stage50K = lerp(current.cryogenics.stage50K, responseActive ? 46.8 : 47.9, 1 - Math.exp(-1.4 * dt));
        const stage4K = lerp(current.cryogenics.stage4K, responseActive ? 4.2 : 4.3, 1 - Math.exp(-1.4 * dt));
        const stage100mK = lerp(current.cryogenics.stage100mK, temperature > 20 ? Math.max(temperature + 4, 23) : 16.2, 1 - Math.exp(-1.8 * dt));
        const mixingChamberMk = lerp(current.cryogenics.mixingChamberMk, temperature, 1 - Math.exp(-2.8 * dt));

        const heatLoad = temperature > 20 ? "high" : "normal";
        const nextLighting: LabLightingMode =
          temperature > 35 ? "critical" : temperature > 20 ? "warning" : current.storyAct === "RECOVERED" ? "normal" : current.storyAct === "STABILIZING" ? "recovery" : current.lightingMode;

        const updatedControl = {
          ...current.control,
          clockLocked: temperature < 35 && current.emergencyResponse !== "safe-mode",
          channels: {
            ...current.control.channels,
            "CH-02":
              current.emergencyResponse === "abort-all"
                ? "idle"
                : current.emergencyResponse === "isolate-ch02"
                  ? "isolated"
                  : current.emergencyResponse === "safe-mode"
                    ? "safe"
                    : heating
                      ? "transmitting"
                      : current.control.channels["CH-02"],
          },
          pulseQueue:
            current.emergencyResponse === "abort-all"
              ? current.control.pulseQueue.map((job) => ({ ...job, status: job.channel === "CH-02" ? "terminated" : job.status }))
              : current.control.pulseQueue,
        };

        const logs = [...current.logs];
        if (temperature >= 21.7 && !eventFlagsRef.current.warningLogged) {
          eventFlagsRef.current.warningLogged = true;
          logs.push({ time: new Date().toTimeString().slice(0, 8), message: "SYSTEM WARNING: QPU thermal drift detected" });
        }
        if (temperature >= 41.7 && !eventFlagsRef.current.criticalLogged) {
          eventFlagsRef.current.criticalLogged = true;
          logs.push({ time: new Date().toTimeString().slice(0, 8), message: "CRYOGENIC INSTABILITY threshold reached" });
        }

        const calibrationRunning = current.experimentSelected === "calibration" && current.experimentRunning;
        const calibrationOffset = calibrationRunning ? lerp(current.calibrationOffset, 0, 1 - Math.exp(-1.9 * dt)) : current.calibrationOffset;
        const calibrationComplete = calibrationRunning && Math.abs(calibrationOffset) < 0.03;

        if (calibrationComplete) {
          if (!eventFlagsRef.current.calibrationLogged) {
            eventFlagsRef.current.calibrationLogged = true;
            logs.push({ time: new Date().toTimeString().slice(0, 8), message: "Calibration complete" });
          }
          next.calibrationState = "complete";
          next.timingAligned = true;
          next.systemTested = true;
          next.experimentRunning = false;
          next.experimentSelected = null;
          next.storyAct = "VALIDATION";
        } else if (calibrationRunning) {
          next.calibrationState = "running";
        }

        if (temperature <= 18.9 && current.storyAct === "STABILIZING") {
          if (!eventFlagsRef.current.recoveryLogged) {
            eventFlagsRef.current.recoveryLogged = true;
            logs.push({ time: new Date().toTimeString().slice(0, 8), message: "Thermal stability restored; calibration invalid" });
          }
          next.storyAct = "RECOVERY_CHECK";
          next.calibrationState = "invalid";
          next.qpuValidated = false;
        }

        if (current.storyAct === "RECOVERY_CHECK" && current.calibrationState === "complete") {
          next.storyAct = "VALIDATION";
        }

        if (temperature < 20 && current.storyAct === "RECOVERED") {
          next.lightingMode = "normal";
        } else {
          next.lightingMode = nextLighting;
        }

        if (temperature > 50 && current.emergencyResponse === null) {
          if (!eventFlagsRef.current.shutdownLogged) {
            eventFlagsRef.current.shutdownLogged = true;
            logs.push({ time: new Date().toTimeString().slice(0, 8), message: "AUTOMATIC QPU PROTECTION engaged" });
          }
          next.emergencyResponse = "safe-mode";
          next.storyAct = "STABILIZING";
          next.qpuTargetTemperatureMk = 16.2;
          return {
            ...next,
            qpuTemperatureMk: temperature,
            qpuTargetTemperatureMk: 16.2,
            cryogenics: {
              ...next.cryogenics,
              stable: false,
              heatLoad,
              stage50K,
              stage4K,
              stage100mK,
              mixingChamberMk,
            },
            control: updatedControl,
            logs,
          };
        }

        const validationReady = next.storyAct === "VALIDATION" && next.calibrationState === "complete";
        if (validationReady && next.experiment.result && next.qpuValidated) {
          next.storyAct = "RECOVERED";
          next.lightingMode = "normal";
        }

        return {
          ...next,
          qpuTemperatureMk: temperature,
          qpuTargetTemperatureMk: targetTemp,
          cryogenics: {
            ...next.cryogenics,
            stable: temperature < 20,
            heatLoad,
            stage50K,
            stage4K,
            stage100mK,
            mixingChamberMk,
          },
          control: updatedControl,
          readout: {
            ...next.readout,
            ready: temperature < 30 && next.calibrationState !== "invalid",
            buffer: Math.min(1024, next.readout.buffer),
            fidelity: temperature < 20 ? 0.985 : temperature < 30 ? 0.957 : 0.912,
          },
        };
      });
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (state.bellTask.step !== "RUNNING" || state.experimentSelected !== "bell" || !state.experimentRunning) return;

    const totalShots = Math.max(1024, state.bellTask.experiment.selectedShots);
    const batchSize = 32;
    const timer = window.setInterval(() => {
      setState((current) => {
        if (current.bellTask.step !== "RUNNING" || current.experimentSelected !== "bell" || !current.experimentRunning) {
          return current;
        }

        const remaining = Math.max(0, totalShots - current.bellShots);
        const nextBatch = Math.min(batchSize, remaining);
        let zeroZero = current.bellHistogram.zeroZero;
        let oneOne = current.bellHistogram.oneOne;
        let other = current.bellHistogram.other;
        for (let i = 0; i < nextBatch; i += 1) {
          const sample = Math.random();
          if (sample < 0.492) zeroZero += 1;
          else if (sample < 0.5) other += 1;
          else if (sample < 0.508) other += 1;
          else oneOne += 1;
        }
        const nextShot = current.bellShots + nextBatch;
        const finished = nextShot >= totalShots;
        const jobStatus: BellJobStatus =
          nextShot < 64
            ? "queued"
            : nextShot < 128
              ? "uploading"
              : nextShot < 256
                ? "control"
                : nextShot < 768
                  ? "executing"
                  : nextShot < totalShots
                    ? "measuring"
                    : "readout";

        if (finished) {
          return {
            ...current,
            bellShots: totalShots,
            bellHistogram: { zeroZero, oneOne, other },
            experimentRunning: false,
            bellPrepared: true,
            readoutArmed: true,
            bellTask: {
              ...current.bellTask,
              experiment: { ...current.bellTask.experiment, jobStatus: "readout" },
              results: {
                shots: totalShots,
                counts: {
                  "00": zeroZero,
                  "01": Math.floor(other / 2),
                  "10": other - Math.floor(other / 2),
                  "11": oneOne,
                },
              },
              step: "ANALYZE_RESULTS",
            },
          };
        }

        return {
          ...current,
          bellShots: nextShot,
          bellHistogram: { zeroZero, oneOne, other },
          readoutArmed: true,
          bellTask: {
            ...current.bellTask,
            experiment: { ...current.bellTask.experiment, jobStatus },
            results: { shots: nextShot, counts: null },
          },
        };
      });
    }, 75);

    return () => window.clearInterval(timer);
  }, [state.experimentRunning, state.experimentSelected, state.bellTask.step, state.bellTask.experiment.selectedShots]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!enteredLab || state.paused || focusRef.current) return;
      if (document.pointerLockElement !== sceneRef.current) return;

      lookVelocityRef.current.x += event.movementX * 0.002352;
      lookVelocityRef.current.y += -event.movementY * 0.001344;
    };

    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [enteredLab, state.paused]);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (document.fullscreenElement === sceneRef.current) {
        if (fullscreenPendingRef.current) {
          fullscreenPendingRef.current = false;
          sceneRef.current?.requestPointerLock?.();
        }
        return;
      }

      if (!document.fullscreenElement && enteredLab) {
        if (document.pointerLockElement === sceneRef.current) {
          document.exitPointerLock?.();
        }
        fullscreenPendingRef.current = false;
        setFullscreenLocked(true);
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [enteredLab]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (
        ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "tab", "escape", "e", "r"].includes(key) ||
        event.code === "Space"
      ) {
        event.preventDefault();
      }
      if (key === "tab") {
        setState((current) => ({ ...current, overviewOpen: !current.overviewOpen }));
        return;
      }
      if (key === "escape") {
        if (document.pointerLockElement) {
          document.exitPointerLock?.();
        }
        if (document.fullscreenElement) {
          void document.exitFullscreen?.();
        }
        setState((current) => (current.focus ? { ...current, focus: null } : { ...current, paused: !current.paused }));
        return;
      }
      if (key === "r") {
        setState((current) => (current.focus ? { ...current, focus: null } : current));
        return;
      }
      if (key === "arrowleft") {
        turnRef.current.left = true;
      }
      if (key === "arrowright") {
        turnRef.current.right = true;
      }
      keysRef.current[key] = true;
      if (event.code === "Space") {
        keysRef.current.space = true;
      }
      if (key === "e") {
        interact();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.key.toLowerCase()] = false;
      if (event.key.toLowerCase() === "arrowleft") {
        turnRef.current.left = false;
      }
      if (event.key.toLowerCase() === "arrowright") {
        turnRef.current.right = false;
      }
      if (event.code === "Space") {
        keysRef.current.space = false;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      if (!state.paused && !focusRef.current) {
        const turnDirection = (turnRef.current.right ? 1 : 0) - (turnRef.current.left ? 1 : 0);
        if (turnDirection !== 0) {
          lookRef.current = {
            x: lookRef.current.x + turnDirection * 1.8 * dt,
            y: lookRef.current.y,
          };
        }
        lookRef.current = {
          x: lookRef.current.x + lookVelocityRef.current.x * dt,
          y: clamp(lookRef.current.y + lookVelocityRef.current.y * dt, -0.45, 0.35),
        };
        lookVelocityRef.current.x *= Math.exp(-7.5 * dt);
        lookVelocityRef.current.y *= Math.exp(-7.5 * dt);
        setLook(lookRef.current);

        if (keysRef.current.space && jumpRef.current.height <= 0.001) {
          jumpRef.current.velocity = 5.5;
        }
        jumpRef.current.velocity -= 13.5 * dt;
        jumpRef.current.height = Math.max(0, jumpRef.current.height + jumpRef.current.velocity * dt);
        if (jumpRef.current.height === 0) {
          jumpRef.current.velocity = 0;
        }
        setJumpHeight(jumpRef.current.height);

        const forward = (keysRef.current["w"] ? 1 : 0) - (keysRef.current["s"] ? 1 : 0);
        const strafe = (keysRef.current["d"] ? 1 : 0) - (keysRef.current["a"] ? 1 : 0);
        const fwdX = Math.sin(yaw);
        const fwdZ = -Math.cos(yaw);
        const rightX = Math.cos(yaw);
        const rightZ = Math.sin(yaw);
        const desiredX = (fwdX * forward + rightX * strafe) * 5.8;
        const desiredZ = (fwdZ * forward + rightZ * strafe) * 5.8;
        velocityRef.current.x = lerp(velocityRef.current.x, desiredX, 1 - Math.exp(-14 * dt));
        velocityRef.current.z = lerp(velocityRef.current.z, desiredZ, 1 - Math.exp(-14 * dt));
        velocityRef.current.x *= Math.exp(-0.55 * dt);
        velocityRef.current.z *= Math.exp(-0.55 * dt);

        const nextX = playerRef.current.x + velocityRef.current.x * dt;
        const nextZ = playerRef.current.z + velocityRef.current.z * dt;

        const nextPlayerX = canMoveTo({ x: nextX, z: playerRef.current.z }) ? nextX : playerRef.current.x;
        const nextPlayerZ = canMoveTo({ x: nextPlayerX, z: nextZ }) ? nextZ : playerRef.current.z;

        if (nextPlayerX !== playerRef.current.x || nextPlayerZ !== playerRef.current.z) {
          playerRef.current = { x: nextPlayerX, z: nextPlayerZ };
          setPlayer(playerRef.current);
        }
      } else {
        lookVelocityRef.current.x = 0;
        lookVelocityRef.current.y = 0;
        if (jumpRef.current.height !== 0) {
          jumpRef.current.height = 0;
          jumpRef.current.velocity = 0;
          setJumpHeight(0);
        }
      }
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [state.paused, yaw]);

  function canMoveTo(next: Vec2) {
    const margin = 0.14;
    const bounds = {
      minX: -ROOM.width / 2 + margin,
      maxX: ROOM.width / 2 - margin,
      minZ: -ROOM.depth / 2 + margin,
      maxZ: ROOM.depth / 2 - margin,
    };
    if (next.x < bounds.minX || next.x > bounds.maxX || next.z < bounds.minZ || next.z > bounds.maxZ) return false;

    const blocked = [
      { x: -3.8, z: 3.0, xSize: 1.24, zSize: 0.82 },
      { x: -4.5, z: 0.5, xSize: 0.76, zSize: 0.6 },
      { x: -0.2, z: -2.4, xSize: 1.46, zSize: 0.94 },
      { x: 1.9, z: 0.1, xSize: state.qpuDoorOpen ? 1.14 : 1.42, zSize: 0.9 },
      { x: 4.4, z: -1.8, xSize: 0.76, zSize: 0.64 },
      { x: -2.3, z: -1.1, xSize: 0.48, zSize: 0.34 },
      { x: 3.2, z: 2.3, xSize: 0.58, zSize: 0.42 },
    ];
    for (const item of blocked) {
      if (Math.abs(next.x - item.x) < item.xSize && Math.abs(next.z - item.z) < item.zSize) {
        return false;
      }
    }
    return true;
  }

  function setFocus(next: FocusId) {
    setState((current) => ({ ...current, focus: next }));
    focusRef.current = next;
  }

  function updateBellTask(updater: (task: BellTaskState) => BellTaskState) {
    setState((current) => ({ ...current, bellTask: updater(current.bellTask) }));
  }

  function appendLog(message: string, time = new Date().toTimeString().slice(0, 8)) {
    setState((current) => ({
      ...current,
      logs: [...current.logs.slice(-7), { time, message }],
    }));
  }

  function startThermalAnomaly() {
    setState((current) => {
      if (current.storyAct !== "NORMAL") return current;
      return {
        ...current,
        storyAct: "ANOMALY",
        emergencyActive: true,
        lightingMode: "warning",
        qpuTemperatureMk: 21.7,
        qpuTargetTemperatureMk: 41.7,
        cryogenics: {
          ...current.cryogenics,
          stable: false,
          heatLoad: "high",
          mixingChamberMk: 21.7,
          stage100mK: 26.4,
        },
        control: {
          ...current.control,
          channels: { ...current.control.channels, "CH-02": "transmitting" },
          pulseQueue: current.control.pulseQueue.map((job) => (job.id === "#8393" ? { ...job, status: "active" } : job)),
        },
        logs: [...current.logs, { time: new Date().toTimeString().slice(0, 8), message: "QPU thermal drift detected" }],
      };
    });
  }

  function resolveEmergency(response: Exclude<EmergencyResponse, null>) {
    setState((current) => {
      const nextChannels = { ...current.control.channels };
      if (response === "abort-all") {
        nextChannels["CH-00"] = "idle";
        nextChannels["CH-01"] = "idle";
        nextChannels["CH-02"] = "idle";
        nextChannels["CH-03"] = "idle";
      } else if (response === "isolate-ch02") {
        nextChannels["CH-02"] = "isolated";
      } else if (response === "safe-mode") {
        nextChannels["CH-02"] = "safe";
      }

      return {
        ...current,
        emergencyResponse: response,
        emergencyActive: false,
        lightingMode: "recovery",
        storyAct: "STABILIZING",
        qpuTargetTemperatureMk: 16.2,
        control: {
          ...current.control,
          channels: nextChannels,
          pulseQueue: current.control.pulseQueue.map((job) =>
            job.channel === "CH-02" ? { ...job, status: response === "abort-all" ? "terminated" : "complete" } : job
          ),
        },
        mystery: {
          ...current.mystery,
          unknownJobVisible: true,
        },
        logs: [
          ...current.logs,
          { time: new Date().toTimeString().slice(0, 8), message: response === "abort-all" ? "All jobs aborted" : response === "isolate-ch02" ? "CH-02 isolated" : "QPU safe mode engaged" },
        ],
      };
    });
  }

  function setBellTaskStep(step: BellTaskStep, patch: Partial<BellTaskState> = {}) {
    updateBellTask((task) => ({ ...task, ...patch, step }));
  }

  function beginBellTask() {
    setState((current) => ({
      ...current,
      bellPrepared: false,
      experimentSelected: null,
      experimentRunning: false,
      bellShots: 0,
      bellHistogram: { zeroZero: 0, oneOne: 0, other: 0 },
      readoutArmed: false,
      whyOpen: false,
      focus: "console",
      bellTask: {
        ...createBellTaskState(),
        step: "BUILD_H",
      },
    }));
  }

  function markBellHadamard() {
    updateBellTask((task) => ({
      ...task,
      circuit: { ...task.circuit, hadamardQ0: true },
      step: "BUILD_CNOT",
    }));
  }

  function markBellCnot() {
    updateBellTask((task) => ({
      ...task,
      circuit: { ...task.circuit, cnotQ0Q1: true },
      step: "VERIFY_CONTROL",
    }));
  }

  function verifyBellControl() {
    setState((current) => ({
      ...current,
      systemTested: true,
      timingAligned: true,
      calibrationState: "complete",
      qpuValidated: false,
      storyAct: current.storyAct === "RECOVERY_CHECK" || current.storyAct === "CALIBRATION" ? "VALIDATION" : current.storyAct,
      focus: "console",
      bellTask: {
        ...current.bellTask,
        hardware: { ...current.bellTask.hardware, controlVerified: true },
        step: "OPEN_QPU",
      },
    }));
  }

  function inspectBellQpu() {
    setState((current) => ({
      ...current,
      qpuLatchReleased: true,
      qpuDoorOpen: true,
      focus: "qpu",
      bellTask: {
        ...current.bellTask,
        hardware: {
          ...current.bellTask.hardware,
          qpuOpened: true,
          qpuInspected: true,
        },
        step: "QUEUE_EXPERIMENT",
      },
    }));
  }

  function queueBellExperiment() {
    setState((current) => {
      const bellCircuit = current.bellTask.circuit.hadamardQ0 && current.bellTask.circuit.cnotQ0Q1;
      const calibrationReady = current.calibrationState === "complete" || current.timingAligned;
      if (!(current.systemTested && current.opticalAligned && current.qpuDoorOpen && calibrationReady)) {
        return {
          ...current,
          storyAct: current.storyAct === "RECOVERY_CHECK" ? "CALIBRATION" : current.storyAct,
          whyOpen: true,
          overviewOpen: true,
          focus: current.focus ?? "console",
        };
      }
      return {
        ...current,
        experimentSelected: "bell",
        experimentRunning: true,
        bellPrepared: true,
        storyAct: "VALIDATION",
        readoutArmed: true,
        bellShots: 0,
        bellHistogram: { zeroZero: 0, oneOne: 0, other: 0 },
        whyOpen: false,
        focus: "readout",
        experiment: {
          ...current.experiment,
          circuit: bellCircuit ? ["H", "CNOT"] : current.experiment.circuit,
          shotsRequested: 1024,
          shotsCompleted: 0,
          jobState: "executing",
          result: null,
        },
        bellTask: {
          ...current.bellTask,
          experiment: { ...current.bellTask.experiment, jobStatus: "queued", selectedShots: 1024 },
          step: "RUNNING",
        },
      };
    });
  }

  function advanceBellQuiz() {
    setBellTaskStep("QUIZ");
  }

  function answerBellQuiz(choice: "A" | "B" | "C") {
    setState((current) => {
      const attempts = current.bellTask.quiz.attempts + 1;
      const correct = choice === "B";
      return {
        ...current,
        bellPrepared: true,
        readoutArmed: true,
        experimentRunning: false,
        bellTask: {
          ...current.bellTask,
          quiz: {
            answered: true,
            correct,
            attempts,
            choice,
          },
          step: correct ? "COMPLETE" : "QUIZ",
          completed: correct,
          experiment: {
            ...current.bellTask.experiment,
            jobStatus: correct ? "complete" : current.bellTask.experiment.jobStatus,
          },
        },
        qpuValidated: correct,
        storyAct: correct ? "RECOVERED" : current.storyAct,
      };
    });
  }

  function enterLab() {
    setEnteredLab(true);
    playerRef.current = { x: 0, z: 3.45 };
    lookRef.current = { x: 0, y: -0.04 };
    lookVelocityRef.current = { x: 0, y: 0 };
    velocityRef.current = { x: 0, z: 0 };
    jumpRef.current = { height: 0, velocity: 0 };
    dragRef.current = { active: false, pointerId: -1, lastX: 0, lastY: 0 };
    setPlayer(playerRef.current);
    setLook(lookRef.current);
    setJumpHeight(0);
    setState((current) => ({ ...current, paused: false }));
    setIntroVisible(false);
    if (!fullscreenLocked) {
      fullscreenPendingRef.current = true;
      void sceneRef.current?.requestFullscreen?.().catch(() => {
        fullscreenPendingRef.current = false;
        sceneRef.current?.requestPointerLock?.();
      });
    } else {
      sceneRef.current?.requestPointerLock?.();
    }
  }

  function requestFullscreenMode() {
    if (!enteredLab) {
      enterLab();
      return;
    }

    setState((current) => ({ ...current, paused: false }));
    setFullscreenLocked(false);
    fullscreenPendingRef.current = true;
    void sceneRef.current?.requestFullscreen?.().catch(() => {
      fullscreenPendingRef.current = false;
      sceneRef.current?.requestPointerLock?.();
    });
  }

  function beginLookDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!enteredLab) {
      enterLab();
    }

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
    };

    if (event.pointerType === "mouse" && !fullscreenLocked) {
      sceneRef.current?.requestPointerLock?.();
    }
  }

  function updateLookFromPointerDelta(dx: number, dy: number) {
    lookRef.current = {
      x: lookRef.current.x + dx * 0.0132,
      y: clamp(lookRef.current.y - dy * 0.009, -0.45, 0.35),
    };
    lookVelocityRef.current.x = dx * 0.048;
    lookVelocityRef.current.y = -dy * 0.03;
    setLook(lookRef.current);
  }

  function updateLookDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;
    const dx = event.clientX - dragRef.current.lastX;
    const dy = event.clientY - dragRef.current.lastY;
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
    updateLookFromPointerDelta(dx, dy);
  }

  function updateLookHover(event: ReactMouseEvent<HTMLDivElement>) {
    if (!enteredLab || state.paused || focusRef.current) return;
    if (dragRef.current.active) return;
    const dx = event.movementX;
    const dy = event.movementY;
    if (dx === 0 && dy === 0) return;
    updateLookFromPointerDelta(dx, dy);
  }

  function endLookDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current.active = false;
  }

  function interact() {
    if (state.paused) return;
    const current = nearest.station;
    if (!current) return;

    if (current.id === "qpu") {
      if (!state.qpuLatchReleased) {
        setState((currentState) => ({
          ...currentState,
          qpuLatchReleased: true,
          qpuDoorOpen: true,
          storyAct: currentState.storyAct === "ANOMALY" ? "DIAGNOSIS" : currentState.storyAct,
          focus: null,
        }));
        return;
      }
      if (!state.qpuDoorOpen) {
        setState((currentState) => ({
          ...currentState,
          qpuDoorOpen: true,
          storyAct: currentState.storyAct === "ANOMALY" ? "DIAGNOSIS" : currentState.storyAct,
          focus: null,
        }));
        return;
      }
      setFocus("qpu");
      if (state.storyAct === "ANOMALY") {
        setState((currentState) => ({ ...currentState, storyAct: "DIAGNOSIS" }));
      }
      return;
    }

    if (current.id === "console") {
      setState((currentState) => ({ ...currentState, systemTested: true, focus: "console", paused: false }));
      return;
    }

    if (current.id === "control") {
      setState((currentState) => ({ ...currentState, focus: "control", storyAct: currentState.storyAct === "ANOMALY" ? "DIAGNOSIS" : currentState.storyAct }));
      return;
    }

    if (current.id === "optical") {
      setState((currentState) => ({ ...currentState, opticalAligned: true, focus: "optical", storyAct: currentState.storyAct === "ANOMALY" ? "DIAGNOSIS" : currentState.storyAct }));
      return;
    }

    if (current.id === "readout") {
      setState((currentState) => ({ ...currentState, readoutArmed: true, focus: "readout", storyAct: currentState.storyAct === "VALIDATION" ? "VALIDATION" : currentState.storyAct }));
    }
  }

  function runCalibration() {
    setState((current) => ({
      ...current,
      experimentSelected: "calibration",
      experimentRunning: true,
      calibrationState: "running",
      storyAct: "CALIBRATION",
      whyOpen: false,
      focus: "console",
      paused: false,
    }));
  }

  function runBellState() {
    queueBellExperiment();
  }

  function toggleWhy() {
    setState((current) => ({ ...current, whyOpen: !current.whyOpen }));
  }

  function nudgeCalibration(delta: number) {
    setState((current) => ({
      ...current,
      calibrationOffset: clamp(current.calibrationOffset + delta, -0.5, 0.5),
      experimentSelected: "calibration",
      experimentRunning: true,
      calibrationState: "running",
      storyAct: "CALIBRATION",
      focus: "console",
    }));
  }

  function lockCalibration() {
    setState((current) => {
      const aligned = Math.abs(current.calibrationOffset) < 0.08;
      return {
        ...current,
        timingAligned: aligned,
        systemTested: aligned,
        experimentRunning: !aligned,
        experimentSelected: aligned ? null : "calibration",
        calibrationState: aligned ? "complete" : "running",
        storyAct: aligned ? "VALIDATION" : "CALIBRATION",
      };
    });
  }

  function adjustOptical(deltaYaw: number, deltaPitch: number) {
    setState((current) => {
      const opticalYaw = clamp(current.opticalYaw + deltaYaw, -0.9, 0.9);
      const opticalPitch = clamp(current.opticalPitch + deltaPitch, -0.55, 0.55);
      const coupling = clamp(1 - (Math.abs(opticalYaw) * 0.8 + Math.abs(opticalPitch) * 1.15), 0, 1);
      return {
        ...current,
        opticalYaw,
        opticalPitch,
        opticalCoupling: coupling,
        opticalAligned: coupling > 0.95,
      };
    });
  }

  function lockOptical() {
    setState((current) => {
      const aligned = current.opticalCoupling > 0.95;
      return {
        ...current,
        opticalAligned: aligned,
        systemTested: aligned ? current.systemTested : current.systemTested,
        experimentSelected: aligned ? current.experimentSelected : "calibration",
        storyAct: aligned && current.storyAct === "ANOMALY" ? "DIAGNOSIS" : current.storyAct,
      };
    });
  }

  function closeQpu() {
    setState((current) => ({
      ...current,
      qpuDoorOpen: false,
      qpuLatchReleased: false,
      focus: null,
    }));
  }

  function runSystemDiagnostics() {
    setState((current) => ({
      ...current,
      storyAct: current.storyAct === "ANOMALY" || current.storyAct === "DIAGNOSIS" ? "DIAGNOSIS" : current.storyAct,
      logs: [...current.logs, { time: new Date().toTimeString().slice(0, 8), message: "Running system diagnostics" }],
      whyOpen: true,
      overviewOpen: true,
    }));
    appendLog("Diagnostic sweep started");
  }

  function abortAllJobs() {
    resolveEmergency("abort-all");
  }

  function isolateCh02() {
    resolveEmergency("isolate-ch02");
  }

  function enterSafeMode() {
    resolveEmergency("safe-mode");
  }

  function runShots() {
    queueBellExperiment();
  }

  function cycleTutorialMode() {
    setState((current) => {
      const next =
        current.tutorialMode === "guided"
          ? "standard"
          : current.tutorialMode === "standard"
            ? "explorer"
            : "guided";
      return { ...current, tutorialMode: next };
    });
  }

  function cycleCameraMode() {
    setState((current) => {
      const next =
        current.cameraMode === "walk"
          ? "overview"
          : current.cameraMode === "overview"
            ? "macro"
            : "walk";
      return { ...current, cameraMode: next };
    });
  }

  const hint = state.focus
    ? STATIONS.find((item) => item.id === state.focus)?.description ?? "Inspect the highlighted station."
    : nearest.station?.description ?? "Walk toward the machine to reveal a station label.";
  const bellReady = state.systemTested && state.opticalAligned && state.qpuDoorOpen;
  const missionStep = getMissionStep(state, enteredLab);

  return (
    <PageShell
      eyebrow="3D trapped-ion lab foundation"
      title="LAB 01: First-Person Lab"
      description="A compact research lab with grounded movement, human-scale collision, a real 3D machine, and an openable QPU enclosure."
      path="/lab/lab01-first-person"
    >
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_20%_15%,rgba(103,232,249,0.12),transparent_30%),radial-gradient(circle_at_80%_8%,rgba(168,85,247,0.1),transparent_22%),linear-gradient(180deg,#04070b_0%,#070c14_58%,#030406_100%)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.44)] md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.42em] text-cyan-200/70">First 90 seconds</p>
              <h2 className="mt-2 text-[clamp(2rem,4vw,4.3rem)] font-medium leading-[0.92] tracking-[-0.06em] text-white">
                {introVisible ? bootLine : enteredLab ? "PHYSICALLY WALK THE LAB" : "ENTER THE LAB"}
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/66">
                Enter the room, approach the stations, open the QPU enclosure, and inspect the processor without leaving the page.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ToolButton icon={SquareDashedBottomCode} label="Mouse look" onClick={() => {}} />
              <ToolButton icon={ScanSearch} label="Tab overview" onClick={() => setState((current) => ({ ...current, overviewOpen: !current.overviewOpen }))} active={state.overviewOpen} />
              <ToolButton icon={PlayCircle} label="Interact [E]" onClick={interact} active={!!nearest.ready} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <MiniStat label="Room" value="16.8m x 12.4m lab" active />
            <MiniStat label="Goal" value={state.focus ? "Inspect in place" : "Find the machine"} active={!!state.focus} />
            <MiniStat label="Hint" value={hint} active={nearest.ready} />
          </div>

          <div
            ref={sceneRef}
            className="relative mt-6 h-[78vh] min-h-[760px] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#09111b_0%,#05070b_100%)] touch-none"
            onClick={() => {
              if (!enteredLab) enterLab();
            }}
            onMouseMove={updateLookHover}
            onPointerDown={beginLookDrag}
            onPointerMove={updateLookDrag}
            onPointerUp={endLookDrag}
            onPointerCancel={endLookDrag}
            onLostPointerCapture={endLookDrag}
          >
            <Canvas className="absolute inset-0 h-full w-full" camera={{ position: [0, 1.68, 3.45], fov: 64 }}>
              <LabRoom player={player} yaw={yaw} pitch={pitch} jumpHeight={jumpHeight} state={state} nearest={nearest} cameraMode={state.cameraMode} />
            </Canvas>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(255,255,255,0.08),transparent_35%),linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.34)_100%)]" />
            <MiniMap player={player} yaw={yaw} enteredLab={enteredLab} />

            <div className="pointer-events-none absolute left-4 top-4 z-20 w-[320px] max-w-[calc(100%-5rem)] rounded-[24px] border border-white/10 bg-[#ECEDEA]/88 p-4 text-[#222829] shadow-[0_18px_50px_rgba(0,0,0,0.2)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#7657C8]/80">{missionStep.label}</p>
                  <p className="mt-1 text-base font-semibold tracking-[-0.03em] text-[#222829]">{missionStep.title}</p>
                </div>
                <div className="rounded-full border border-[#B9BEC0]/50 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#30383B]">
                  {missionStep.progressLabel}
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#30383B]/80">{missionStep.detail}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full border border-[#B9BEC0]/50 bg-white/80">
                <div className="h-full bg-gradient-to-r from-[#3A8DDE] via-[#38C6A3] to-[#7657C8]" style={{ width: `${missionStep.progressValue}%` }} />
              </div>
            </div>

            <div className="pointer-events-none absolute left-4 top-28 z-20">
              <AnimatePresence>
                {(!enteredLab || (nearest.station && nearest.proximity !== "far" && !state.focus)) && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="rounded-full border border-white/12 bg-black/45 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/60 backdrop-blur-sm"
                  >
                    {!enteredLab ? "[E] enter lab" : nearest.ready ? "[E] inspect" : nearest.station?.name}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {(nearest.station?.id === "readout" || state.focus === "readout") && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="pointer-events-auto absolute right-4 top-[calc(7rem+1rem)] z-20 w-[310px] rounded-[24px] border border-white/12 bg-black/52 p-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-md"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#CBB7FF]">
                    Final step
                  </p>
                  <p className="mt-2 text-[16px] font-semibold tracking-[-0.03em]">
                    Bell experiment queue
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/68">
                    {bellReady
                      ? "You are at the readout station. Start the Bell state and then run the shot queue."
                      : "Go back and finish console, optics, and QPU first. The Bell queue unlocks after that."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ToolButton
                      icon={Waves}
                      label={bellReady ? (state.experimentSelected === "bell" ? "Bell running" : "Bell state") : "Bell state locked"}
                      onClick={runBellState}
                      active={state.experimentSelected === "bell"}
                    />
                    <ToolButton
                      icon={ToggleLeft}
                      label="Run shots"
                      onClick={runShots}
                      active={state.experimentSelected === "bell" && state.experimentRunning}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className={`h-3 w-3 rounded-full border ${nearest.ready ? "border-cyan-200 bg-cyan-200/30" : "border-white/40 bg-white/10"}`} />
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <ToolButton
                  icon={Shield}
                  label="Forward"
                  onClick={() => {
                    if (!enteredLab) {
                      enterLab();
                    } else {
                      playerRef.current = { x: playerRef.current.x, z: clamp(playerRef.current.z - 0.8, -4, 4) };
                      setPlayer(playerRef.current);
                    }
                  }}
                />
                <ToolButton icon={ArrowRight} label="Inspect [E]" onClick={interact} active={nearest.ready} />
                <ToolButton icon={ToggleLeft} label="Leave [R]" onClick={() => setFocus(null)} />
                {fullscreenLocked && enteredLab && (
                  <ToolButton icon={ScanSearch} label="Re-enter fullscreen" onClick={requestFullscreenMode} active />
                )}
              </div>
              <div className="rounded-full border border-white/10 bg-black/45 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/50">
                {state.paused ? "PAUSED" : state.focus ? `FOCUS / ${state.focus.toUpperCase()}` : !enteredLab ? "ENTER LAB" : nearest.ready ? "READY" : "MOVE TO STATIONS"}
              </div>
            </div>

            <OverviewOverlay open={state.overviewOpen} state={state} />

            <AnimatePresence>
              {state.paused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
                >
                  <div className="max-w-md rounded-[28px] border border-white/10 bg-[#070b12]/90 p-6 text-center shadow-[0_28px_100px_rgba(0,0,0,0.55)]">
                    <p className="font-mono text-[11px] uppercase tracking-[0.42em] text-cyan-200/70">Paused</p>
                    <h3 className="mt-3 text-[clamp(1.8rem,3vw,2.8rem)] font-medium tracking-[-0.05em] text-white">The lab is still here.</h3>
                    <p className="mt-4 text-sm leading-7 text-white/66">Press Esc again to resume and keep walking around the machine.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {introVisible && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/72 p-6 backdrop-blur-sm"
                >
                  <div className="max-w-2xl rounded-[28px] border border-white/10 bg-[#070b12]/90 p-6 text-center shadow-[0_28px_100px_rgba(0,0,0,0.55)]">
                    <p className="font-mono text-[11px] uppercase tracking-[0.42em] text-cyan-200/70">System boot</p>
                    <h3 className="mt-3 text-[clamp(1.8rem,3vw,3rem)] font-medium tracking-[-0.05em] text-white">Walk into the lab.</h3>
                    <p className="mt-4 text-sm leading-7 text-white/66">
                      A compact lab foundation with a real 3D machine, grounded movement, and an openable QPU service panel.
                    </p>
                    <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.32em] text-white/42">
                      WASD move · Mouse look · Space jump · E interact · R exit · Tab overview · Esc pause
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <StatusPanel
          state={state}
          nearest={nearest}
          enteredLab={enteredLab}
          onToggleOverview={() => setState((current) => ({ ...current, overviewOpen: !current.overviewOpen }))}
          onEnterLab={enterLab}
          onGoToConsole={() => {
            if (!enteredLab) {
              enterLab();
            }
            setFocus("console");
          }}
          onGoToQpu={() => {
            if (!enteredLab) {
              enterLab();
            }
            setFocus("qpu");
          }}
          onOpenQpu={() => {
            if (!enteredLab) {
              enterLab();
            }
            setState((current) => ({ ...current, qpuLatchReleased: true, qpuDoorOpen: true, focus: "qpu" }));
          }}
          onCloseQpu={closeQpu}
          onSystemTest={() => {
            if (!enteredLab) {
              enterLab();
            }
            setState((current) => ({ ...current, systemTested: true, focus: "console", paused: false }));
          }}
          onRunCalibration={runCalibration}
          onRunBell={runBellState}
          onRunSystemDiagnostics={runSystemDiagnostics}
          onAbortAllJobs={abortAllJobs}
          onIsolateCh02={isolateCh02}
          onEnterSafeMode={enterSafeMode}
          onToggleWhy={toggleWhy}
          onNudgeCalibration={nudgeCalibration}
          onLockCalibration={lockCalibration}
          onAdjustOptical={adjustOptical}
          onLockOptical={lockOptical}
          onCycleTutorialMode={cycleTutorialMode}
          onCycleCameraMode={cycleCameraMode}
          onRunShots={runShots}
          onBeginBellTask={beginBellTask}
          onMarkBellHadamard={markBellHadamard}
          onMarkBellCnot={markBellCnot}
          onVerifyBellControl={verifyBellControl}
          onInspectBellQpu={inspectBellQpu}
          onQueueBellExperiment={queueBellExperiment}
          onAdvanceBellQuiz={advanceBellQuiz}
          onAnswerBellQuiz={answerBellQuiz}
          onReset={() => {
            playerRef.current = { x: 0, z: 3.45 };
            lookRef.current = { x: 0, y: -0.04 };
            lookVelocityRef.current = { x: 0, y: 0 };
            velocityRef.current = { x: 0, z: 0 };
            jumpRef.current = { height: 0, velocity: 0 };
            dragRef.current = { active: false, pointerId: -1, lastX: 0, lastY: 0 };
            turnRef.current = { left: false, right: false };
            eventFlagsRef.current = { warningLogged: false, criticalLogged: false, recoveryLogged: false, shutdownLogged: false, calibrationLogged: false };
            storyStartedRef.current = false;
            enteredAtRef.current = null;
            setPlayer(playerRef.current);
            setLook(lookRef.current);
            setJumpHeight(0);
            setFocus(null);
            setEnteredLab(false);
            setState({
              ...createWorldState(),
              bellTask: createBellTaskState(),
              logs: [],
              emergencyActive: false,
              emergencyResponse: null,
              storyAct: "NORMAL",
              lightingMode: "normal",
              mystery: { unknownJobVisible: false, unknownJobId: "#8393" },
              control: {
                clockLocked: true,
                channels: { "CH-00": "idle", "CH-01": "idle", "CH-02": "idle", "CH-03": "idle" },
                pulseQueue: [
                  { id: "#8391", channel: "CH-00", label: "H(Q0)", status: "complete" },
                  { id: "#8392", channel: "CH-01", label: "CNOT(Q0,Q1)", status: "complete" },
                  { id: "#8393", channel: "CH-02", label: "continuous-drive", status: "active" },
                  { id: "#8394", channel: "CH-02", label: "unknown", status: "queued" },
                  { id: "#8395", channel: "CH-02", label: "unknown", status: "queued" },
                ],
              },
              readout: { ready: true, fidelity: 0.975, buffer: 0 },
              experiment: { circuit: ["H", "CNOT"], shotsRequested: 1024, shotsCompleted: 0, jobState: "idle", result: null },
            });
          }}
        />
      </div>
    </PageShell>
  );
}
