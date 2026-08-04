import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

export interface NarrativeHook {
  analogy: string;
  question: string;
  invitation: string;
}

type LabMode = "guided" | "explore" | "research";

export interface Insight {
  id: string;
  condition: (ctx: Record<string, unknown>) => boolean;
  priority?: number;
  tag: "discovery" | "warning" | "tip" | "milestone";
  headline: string;
  body: string;
}

export interface MissionStep {
  id: string;
  title: string;
  instruction: string;
  question?: string;
  prediction?: {
    prompt: string;
    options: { id: string; label: string }[];
  };
  focusControl?: string;
  focusVisual?: string;
  completion: (ctx: Record<string, unknown>) => boolean;
  successMessage: string;
  explanation: string;
  hint?: string;
}

export interface MissionConfig {
  title: string;
  estimatedMinutes: number;
  difficulty: string;
  steps: MissionStep[];
  conclusion: {
    takeaway: string;
    evidence: (ctx: Record<string, unknown>) => string;
    equation?: string;
    nextLab?: string;
    nextLabHref?: string;
  };
}

export interface NarrativeConfig {
  labSlug?: string;
  hook: NarrativeHook;
  insights: Insight[];
  observe?: (ctx: Record<string, unknown>) => string | null;
  mission?: MissionConfig;
  modelScope?: string;
  definitions?: { term: string; meaning: string }[];
  researchNotes?: string[];
  screenReaderSummary?: (ctx: Record<string, unknown>) => string;
}

interface LabNarrativeProps {
  config: NarrativeConfig;
  ctx: Record<string, unknown>;
  position?: "above" | "below";
  children?: ReactNode;
}

const TAG_STYLES: Record<Insight["tag"], { bg: string; text: string; label: string }> = {
  discovery: { bg: "bg-accent-subtle", text: "text-accent", label: "Discovery" },
  warning: { bg: "bg-[rgba(234,88,12,0.12)]", text: "text-[#EA580C]", label: "Watch out" },
  tip: { bg: "bg-[rgba(139,92,246,0.12)]", text: "text-[#8B5CF6]", label: "Tip" },
  milestone: { bg: "bg-[rgba(217,70,239,0.12)]", text: "text-[#D946EF]", label: "Milestone" },
};

const MODE_LABELS: Record<LabMode, string> = {
  guided: "Guided",
  explore: "Free explore",
  research: "Research",
};

function numberFrom(ctx: Record<string, unknown>, key: string, fallback = 0): number {
  const value = ctx[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringFrom(ctx: Record<string, unknown>, key: string, fallback = ""): string {
  const value = ctx[key];
  return typeof value === "string" ? value : fallback;
}

function boolFrom(ctx: Record<string, unknown>, key: string, fallback = false): boolean {
  const value = ctx[key];
  return typeof value === "boolean" ? value : fallback;
}

function InsightPanel({ insight }: { insight: Insight }) {
  const [visible, setVisible] = useState(false);
  const style = TAG_STYLES[insight.tag];

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 40);
    return () => window.clearTimeout(timer);
  }, [insight.id]);

  return (
    <div
      className={`rounded-panel border border-border p-4 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`rounded-md px-2 py-0.5 font-mono text-mono-label uppercase ${style.bg} ${style.text}`}>
          {style.label}
        </span>
        <span className="text-small font-medium text-text-primary">{insight.headline}</span>
      </div>
      <p className="text-small text-text-secondary">{insight.body}</p>
    </div>
  );
}

function ModeSwitch({
  mode,
  onModeChange,
}: {
  mode: LabMode;
  onModeChange: (mode: LabMode) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <p className="font-mono text-mono-label uppercase text-text-muted">Learning mode</p>
      <div className="flex rounded-md border border-border bg-readout-bg p-1" role="tablist" aria-label="Lab learning mode">
        {(Object.keys(MODE_LABELS) as LabMode[]).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => onModeChange(value)}
            className={`rounded px-3 py-1.5 text-small font-medium transition-colors duration-150 ${
              mode === value ? "bg-accent text-text-primary" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {MODE_LABELS[value]}
          </button>
        ))}
      </div>
    </div>
  );
}

function BriefingCard({
  config,
  onBegin,
  onExplore,
}: {
  config: NarrativeConfig;
  onBegin: () => void;
  onExplore: () => void;
}) {
  const mission = config.mission;

  return (
    <div className="mb-8 rounded-panel border border-accent/40 bg-accent-subtle p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-accent px-2 py-0.5 font-mono text-mono-label uppercase text-text-primary">
          Mission briefing
        </span>
        {mission && (
          <span className="font-mono text-mono-label uppercase text-text-muted">
            {mission.difficulty} / {mission.estimatedMinutes} min
          </span>
        )}
      </div>
      <h2 className="text-h4 text-text-primary">{mission?.title ?? config.hook.question}</h2>
      <p className="mt-3 text-body text-text-secondary">{config.hook.analogy}</p>
      <p className="mt-3 text-small text-text-secondary">{config.hook.invitation}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={onBegin}
          className="rounded-md bg-accent px-4 py-2 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover"
        >
          Begin experiment
        </button>
        <button
          onClick={onExplore}
          className="rounded-md border border-border px-4 py-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary"
        >
          Open free explore
        </button>
      </div>
    </div>
  );
}

function MissionBar({
  step,
  stepIndex,
  totalSteps,
  complete,
  onHint,
  onNext,
  onRestart,
}: {
  step: MissionStep;
  stepIndex: number;
  totalSteps: number;
  complete: boolean;
  onHint: () => void;
  onNext: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="sticky top-4 z-20 mb-6 rounded-panel border border-border bg-background/95 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur" aria-label="Mission progress">
      <div className="mb-4 h-1 overflow-hidden bg-border" aria-hidden="true">
        <div
          className="h-full bg-accent transition-[width] duration-300"
          style={{ width: `${((stepIndex + Number(complete)) / totalSteps) * 100}%` }}
        />
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-mono-label uppercase text-text-muted">
            Step {stepIndex + 1} / {totalSteps}
          </p>
          <p className="mt-1 text-body font-medium text-text-primary">{step.title}</p>
          <p className="mt-1 text-small text-text-secondary">{step.instruction}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span
            className={`rounded-md px-2 py-1 font-mono text-mono-label uppercase ${
              complete ? "bg-accent-subtle text-accent" : "bg-readout-bg text-text-muted"
            }`}
          >
            {complete ? "Evidence matched" : "Active"}
          </span>
          {step.hint && (
            <button
              onClick={onHint}
              className="rounded-md border border-border px-3 py-1.5 text-small text-text-secondary hover:border-border-strong hover:text-text-primary"
            >
              Hint
            </button>
          )}
          <button
            onClick={onRestart}
            className="rounded-md border border-border px-3 py-1.5 text-small text-text-secondary hover:border-border-strong hover:text-text-primary"
          >
            Restart
          </button>
          <button
            onClick={onNext}
            disabled={!complete}
            className="rounded-md bg-accent px-3 py-1.5 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function PredictionPrompt({
  step,
  selected,
  onSelect,
}: {
  step: MissionStep;
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  if (!step.prediction) return null;

  return (
    <div className="mb-6 rounded-panel border border-border bg-surface p-4">
      <p className="font-mono text-mono-label uppercase text-text-muted">Prediction</p>
      <p className="mt-1 text-small font-medium text-text-primary">{step.prediction.prompt}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {step.prediction.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`rounded-md border px-3 py-2 text-left text-small transition-colors duration-150 ${
              selected === option.id
                ? "border-accent bg-accent-subtle text-text-primary"
                : "border-border text-text-secondary hover:border-border-strong hover:text-text-primary"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LiveInterpretation({
  insight,
  observation,
  missionStep,
  missionComplete,
  baseline,
}: {
  insight: Insight | null;
  observation: string | null;
  missionStep?: MissionStep;
  missionComplete?: boolean;
  baseline?: string | null;
}) {
  return (
    <div className="mb-8 rounded-panel border border-border bg-surface p-4">
      <p className="font-mono text-mono-label uppercase text-text-muted">Live interpretation</p>
      {missionStep && (
        <p className="mt-2 text-small text-text-secondary">
          {missionComplete ? missionStep.successMessage : missionStep.explanation}
        </p>
      )}
      {insight && <div className="mt-3"><InsightPanel key={insight.id} insight={insight} /></div>}
      {observation && <ObservationStrip text={observation} />}
      {baseline && observation && baseline !== observation && (
        <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <p className="font-mono text-mono-label uppercase text-text-muted">Before</p>
            <p className="mt-1 text-small text-text-secondary">{baseline}</p>
          </div>
          <div>
            <p className="font-mono text-mono-label uppercase text-accent">After</p>
            <p className="mt-1 text-small text-text-primary">{observation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DefinitionsCard({ definitions }: { definitions: NonNullable<NarrativeConfig["definitions"]> }) {
  return (
    <div className="mb-8 border-y border-border py-4">
      <p className="font-mono text-mono-label uppercase text-text-muted">Definitions on demand</p>
      <div className="mt-3 divide-y divide-border">
        {definitions.map((item) => (
          <details key={item.term} className="group py-3">
            <summary className="cursor-pointer list-none text-small font-medium text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              {item.term}
              <span className="float-right text-text-muted" aria-hidden="true">+</span>
            </summary>
            <p className="mt-2 max-w-3xl text-small text-text-secondary">{item.meaning}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function ResearchNotes({ notes }: { notes: string[] }) {
  return (
    <div className="mb-8 border-y border-border py-4">
      <p className="font-mono text-mono-label uppercase text-text-muted">Research notes</p>
      <ul className="mt-3 space-y-2">
        {notes.map((note) => <li key={note} className="text-small text-text-secondary">{note}</li>)}
      </ul>
    </div>
  );
}

function ModelScopeCard({ text }: { text: string }) {
  return (
    <div className="mb-8 rounded-panel border border-border bg-readout-bg p-4">
      <p className="font-mono text-mono-label uppercase text-text-muted">Model scope</p>
      <p className="mt-1 text-small text-text-secondary">{text}</p>
    </div>
  );
}

function ConclusionCard({
  mission,
  ctx,
  onRestart,
}: {
  mission: MissionConfig;
  ctx: Record<string, unknown>;
  onRestart: () => void;
}) {
  return (
    <div className="mb-8 rounded-panel border border-accent/40 bg-accent-subtle p-5">
      <p className="font-mono text-mono-label uppercase text-accent">You discovered</p>
      <h2 className="mt-2 text-h4 text-text-primary">{mission.conclusion.takeaway}</h2>
      <p className="mt-3 text-small text-text-secondary">{mission.conclusion.evidence(ctx)}</p>
      {mission.conclusion.equation && (
        <p className="mt-4 rounded-md border border-border bg-background px-3 py-2 font-mono text-small text-text-primary">
          {mission.conclusion.equation}
        </p>
      )}
      {mission.conclusion.nextLab && (
        mission.conclusion.nextLabHref ? (
          <Link className="mt-4 inline-flex text-small font-medium text-accent hover:text-accent-hover" to={mission.conclusion.nextLabHref}>
            {mission.conclusion.nextLab}
          </Link>
        ) : <p className="mt-3 text-small text-text-secondary">{mission.conclusion.nextLab}</p>
      )}
      <button
        onClick={onRestart}
        className="mt-5 rounded-md border border-border px-4 py-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary"
      >
        Restart mission
      </button>
    </div>
  );
}

function ObservationStrip({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState(text);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (text === displayed) return;
    setFading(true);
    const timer = window.setTimeout(() => {
      setDisplayed(text);
      setFading(false);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [displayed, text]);

  return (
    <p className={`mt-3 text-small text-text-secondary transition-opacity duration-200 ${fading ? "opacity-0" : "opacity-100"}`}>
      <span className="mr-1.5 font-mono text-mono-label uppercase text-text-muted">Now</span>
      {displayed}
    </p>
  );
}

function HookCard({
  hook,
  collapsed,
  onToggle,
}: {
  hook: NarrativeHook;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-8 rounded-panel border border-border bg-surface">
      <button onClick={onToggle} className="flex w-full items-start justify-between gap-4 p-5 text-left">
        <div className="min-w-0 flex-1">
          <p className="mb-1 font-mono text-mono-label uppercase text-text-muted">What's happening here</p>
          <p className="text-body font-medium text-text-primary">{hook.analogy}</p>
          {!collapsed && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-0.5 font-mono text-mono-label uppercase text-text-muted">Question</p>
                <p className="text-small text-text-secondary">{hook.question}</p>
              </div>
              <div>
                <p className="mb-0.5 font-mono text-mono-label uppercase text-text-muted">Try this</p>
                <p className="text-small text-text-secondary">{hook.invitation}</p>
              </div>
            </div>
          )}
        </div>
        <span className="mt-0.5 shrink-0 font-mono text-mono-label text-text-muted">{collapsed ? "Open" : "Hide"}</span>
      </button>
    </div>
  );
}

export default function LabNarrative({
  config,
  ctx,
  position = "above",
  children,
}: LabNarrativeProps) {
  const [hookCollapsed, setHookCollapsed] = useState(false);
  const [mode, setMode] = useState<LabMode>("guided");
  const [started, setStarted] = useState(!config.mission);
  const [stepIndex, setStepIndex] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [baseline, setBaseline] = useState<string | null>(null);
  const topInsight = useMemo(
    () =>
      config.insights
        .filter((insight) => insight.condition(ctx))
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0] ?? null,
    [config, ctx]
  );
  const observation = config.observe?.(ctx) ?? null;
  const mission = config.mission;
  const currentStep = mission?.steps[stepIndex] ?? null;
  const missionComplete = Boolean(currentStep?.completion(ctx));
  const isLastStep = Boolean(mission && stepIndex >= mission.steps.length);

  useEffect(() => {
    if (!config.labSlug || !mission) return;
    const stored = window.localStorage.getItem(`mrama.lab.${config.labSlug}.progress`);
    if (!stored) return;
    try {
      const progress = JSON.parse(stored) as { stepIndex?: number; completed?: boolean };
      setCompleted(Boolean(progress.completed));
      if (typeof progress.stepIndex === "number") {
        setStepIndex(Math.min(Math.max(0, progress.stepIndex), mission.steps.length));
      }
    } catch {
      window.localStorage.removeItem(`mrama.lab.${config.labSlug}.progress`);
    }
  }, [config.labSlug, mission]);

  useEffect(() => {
    if (!config.labSlug || !mission || !isLastStep) return;
    window.localStorage.setItem(
      `mrama.lab.${config.labSlug}.progress`,
      JSON.stringify({ stepIndex: mission.steps.length, completed: true })
    );
    setCompleted(true);
  }, [config.labSlug, isLastStep, mission]);

  useEffect(() => {
    if (!config.labSlug || !mission || !started) return;
    window.localStorage.setItem(
      `mrama.lab.${config.labSlug}.progress`,
      JSON.stringify({ stepIndex, completed: isLastStep })
    );
  }, [config.labSlug, isLastStep, mission, started, stepIndex]);

  useEffect(() => {
    if (!config.labSlug) return;
    window.dispatchEvent(new CustomEvent("mrama:lab-learning", {
      detail: { lab: config.labSlug, mode, step: currentStep?.id ?? null, complete: isLastStep },
    }));
  }, [config.labSlug, currentStep?.id, isLastStep, mode]);

  const restartMission = () => {
    setStarted(true);
    setMode("guided");
    setStepIndex(0);
    setHintVisible(false);
    setPrediction(null);
    setBaseline(config.observe?.(ctx) ?? null);
  };

  const advanceMission = () => {
    if (!missionComplete || !mission) return;
    setStepIndex((value) => Math.min(value + 1, mission.steps.length));
    setHintVisible(false);
    setPrediction(null);
  };

  const narrativeShell = mission ? (
    <>
      {mode === "guided" && started && currentStep && (
        <style>
          {`
            [data-lab-control="${currentStep.focusControl ?? ""}"],
            [data-lab-visual="${currentStep.focusVisual ?? ""}"] {
              position: relative;
              outline: 2px solid rgba(217, 70, 239, 0.72);
              outline-offset: 6px;
              box-shadow: 0 0 0 1px rgba(217, 70, 239, 0.2), 0 0 36px rgba(217, 70, 239, 0.18);
            }
          `}
        </style>
      )}
      <ModeSwitch
        mode={mode}
        onModeChange={(nextMode) => {
          setMode(nextMode);
          if (nextMode !== "guided") setStarted(true);
        }}
      />
      {mode === "guided" && !started && (
        <BriefingCard
          config={config}
          onBegin={() => {
            setBaseline(observation);
            setStarted(true);
          }}
          onExplore={() => {
            setMode("explore");
            setStarted(true);
          }}
        />
      )}
      {mode === "guided" && started && currentStep && (
        <>
          <MissionBar
            step={currentStep}
            stepIndex={stepIndex}
            totalSteps={mission.steps.length}
            complete={missionComplete}
            onHint={() => setHintVisible((value) => !value)}
            onNext={advanceMission}
            onRestart={restartMission}
          />
          {hintVisible && currentStep.hint && (
            <div className="mb-6 rounded-panel border border-border bg-readout-bg p-4 text-small text-text-secondary">
              {currentStep.hint}
            </div>
          )}
          {currentStep.question && (
            <div className="mb-6 rounded-panel border border-border bg-surface p-4">
              <p className="font-mono text-mono-label uppercase text-text-muted">Question</p>
              <p className="mt-1 text-small text-text-secondary">{currentStep.question}</p>
            </div>
          )}
          <PredictionPrompt step={currentStep} selected={prediction} onSelect={setPrediction} />
          <LiveInterpretation
            insight={topInsight}
            observation={observation}
            missionStep={currentStep}
            missionComplete={missionComplete}
            baseline={baseline}
          />
        </>
      )}
      {mode === "guided" && started && isLastStep && (
        <ConclusionCard mission={mission} ctx={ctx} onRestart={restartMission} />
      )}
      {mode !== "guided" && (
        <>
          <HookCard
            hook={config.hook}
            collapsed={hookCollapsed}
            onToggle={() => setHookCollapsed((value) => !value)}
          />
          <LiveInterpretation insight={topInsight} observation={observation} />
          {mode === "research" && config.modelScope && <ModelScopeCard text={config.modelScope} />}
          {mode === "research" && config.researchNotes && <ResearchNotes notes={config.researchNotes} />}
        </>
      )}
      {config.definitions && <DefinitionsCard definitions={config.definitions} />}
      {completed && mode === "guided" && (
        <p className="mb-6 font-mono text-mono-label uppercase text-accent">Mission previously completed</p>
      )}
    </>
  ) : null;

  const narrative = (
    <>
      {narrativeShell ?? (
        <>
          <HookCard
            hook={config.hook}
            collapsed={hookCollapsed}
            onToggle={() => setHookCollapsed((value) => !value)}
          />
          {(topInsight || observation) && (
            <div className="mb-8 space-y-3">
              {topInsight && <InsightPanel key={topInsight.id} insight={topInsight} />}
              {observation && <ObservationStrip text={observation} />}
            </div>
          )}
          {config.modelScope && <ModelScopeCard text={config.modelScope} />}
        </>
      )}
    </>
  );

  return (
    <>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {config.screenReaderSummary?.(ctx) ?? observation ?? "Lab state updated."}
      </p>
      {position === "above" && narrative}
      {children}
      {position === "below" && narrative}
    </>
  );
}

export const BLOCH_NARRATIVE: NarrativeConfig = {
  labSlug: "bloch-sphere",
  hook: {
    analogy: "A qubit is a pointer on a sphere: its direction controls the chance of measuring 0 or 1.",
    question: "How do gates move a quantum state, and what changes when phase changes?",
    invitation: "Try a |+> state, rotate around Z, and watch probabilities stay fixed while phase changes.",
  },
  mission: {
    title: "Navigate one qubit",
    estimatedMinutes: 6,
    difficulty: "Beginner",
    steps: [
      {
        id: "basis",
        title: "Start from a measurable pole",
        question: "If a state points at a pole, what should measurement do?",
        instruction: "Use a preset or theta slider so one measurement outcome is almost certain.",
        focusControl: "preset-state",
        focusVisual: "bloch-sphere",
        prediction: {
          prompt: "What evidence should confirm that the qubit is near a basis state?",
          options: [
            { id: "probability", label: "One probability should be near 1." },
            { id: "phase", label: "Phi should decide 0 versus 1." },
            { id: "equal", label: "Both probabilities should be equal." },
          ],
        },
        completion: (ctx) => numberFrom(ctx, "p0") > 0.96 || numberFrom(ctx, "p1") > 0.96,
        successMessage: "The evidence is near-deterministic: one outcome dominates the readout.",
        explanation: "Theta controls how far the pointer sits between the north and south poles.",
        hint: "The |0> and |1> presets are the fastest way to see a pole state.",
      },
      {
        id: "balanced",
        title: "Create a balanced superposition",
        question: "Can a single state make 0 and 1 equally likely?",
        instruction: "Move theta near 90 degrees or choose a plus-state preset.",
        focusControl: "theta",
        focusVisual: "bloch-sphere",
        prediction: {
          prompt: "What should the probability bars show at the equator?",
          options: [
            { id: "half", label: "P(0) and P(1) should both be about 0.5." },
            { id: "zero", label: "One probability should drop to 0." },
            { id: "random", label: "The readout should become random noise." },
          ],
        },
        completion: (ctx) => Math.abs(numberFrom(ctx, "p0") - 0.5) < 0.06,
        successMessage: "The state is on the equator, so measurement is balanced between 0 and 1.",
        explanation: "Superposition here is visible as probability balance, not as hidden randomness.",
        hint: "Set theta to 90 degrees. Phi can be any angle for this step.",
      },
      {
        id: "phase",
        title: "Change phase without changing probability",
        question: "Can the qubit change while the measurement probabilities stay the same?",
        instruction: "Keep theta near 90 degrees, then change phi or apply an Rz rotation.",
        focusControl: "phi",
        focusVisual: "bloch-sphere",
        completion: (ctx) =>
          Math.abs(numberFrom(ctx, "p0") - 0.5) < 0.08 && numberFrom(ctx, "phi") > 0.35,
        successMessage: "Phi changed the direction around the equator while P(0) and P(1) stayed balanced.",
        explanation: "Phase is invisible to this one measurement basis, but it matters once later gates interfere.",
        hint: "Use |+>, then drag Phi or press Rz with a visible rotation angle.",
      },
      {
        id: "target-one",
        title: "Reach the opposite pole",
        question: "Which move flips the state from the north pole to the south pole?",
        instruction: "Use a preset or gate so P(1) becomes almost certain.",
        focusControl: "gate",
        focusVisual: "bloch-sphere",
        completion: (ctx) => numberFrom(ctx, "p1") > 0.96,
        successMessage: "The state is now near |1>, the opposite measurement pole.",
        explanation: "A gate acts as a rotation in state space, not as a classical switch on a hidden bit.",
        hint: "From |0>, the X gate sends the pointer to the opposite pole.",
      },
    ],
    conclusion: {
      takeaway: "A single qubit is best understood as a direction whose measurement evidence depends on angle.",
      evidence: (ctx) =>
        `Your final state has P(0) = ${numberFrom(ctx, "p0").toFixed(3)} and P(1) = ${numberFrom(ctx, "p1").toFixed(3)}.`,
      equation: "|psi> = cos(theta/2)|0> + e^(i phi) sin(theta/2)|1>",
      nextLab: "Next: combine gates and multiple qubits in Circuit Playground.",
      nextLabHref: "/lab/circuit",
    },
  },
  modelScope:
    "This page performs an exact single-qubit statevector calculation in the browser. It does not sample hardware noise or run on a quantum device.",
  definitions: [
    { term: "Theta", meaning: "The polar angle controlling movement between the |0> and |1> measurement poles." },
    { term: "Phi", meaning: "The azimuthal phase angle around the equator; it can change while Z-basis probabilities stay fixed." },
    { term: "Gate", meaning: "A reversible transformation represented here as a rotation of the qubit state." },
  ],
  researchNotes: ["Angles and amplitudes are computed as a normalized pure state.", "No shot sampling, decoherence, gate error, or hardware calibration is included."],
  screenReaderSummary: (ctx) => `Theta ${numberFrom(ctx, "theta").toFixed(2)} radians, phi ${numberFrom(ctx, "phi").toFixed(2)} radians, probability zero ${numberFrom(ctx, "p0").toFixed(3)}, probability one ${numberFrom(ctx, "p1").toFixed(3)}.`,
  insights: [
    {
      id: "balanced",
      tag: "discovery",
      headline: "You found the equator",
      body: "When P(0) and P(1) are both near 0.5, the state is balanced between the two measurement outcomes.",
      condition: (ctx) => Math.abs(numberFrom(ctx, "p0") - 0.5) < 0.04,
      priority: 2,
    },
    {
      id: "basis",
      tag: "tip",
      headline: "Near a basis pole",
      body: "Near the poles, measurement is almost deterministic even though phase may still be present.",
      condition: (ctx) => numberFrom(ctx, "p0") > 0.96 || numberFrom(ctx, "p1") > 0.96,
    },
  ],
  observe: (ctx) => `Theta ${numberFrom(ctx, "theta").toFixed(2)} rad, phi ${numberFrom(ctx, "phi").toFixed(2)} rad.`,
};

export const CIRCUIT_NARRATIVE: NarrativeConfig = {
  labSlug: "circuit",
  hook: {
    analogy: "A circuit is a score for quantum amplitudes: each gate edits the pattern before measurement.",
    question: "How do local gate choices become a full statevector over all basis states?",
    invitation: "Load a Bell-state example, then remove one gate and compare the histogram.",
  },
  mission: {
    title: "Build quantum behavior",
    estimatedMinutes: 9,
    difficulty: "Intermediate",
    steps: [
      {
        id: "flip", title: "Flip one qubit", question: "What circuit sends |0> to |1>?",
        instruction: "Use one qubit and place an X gate.", focusControl: "gate-palette", focusVisual: "probabilities",
        completion: (ctx) => numberFrom(ctx, "numQubits") === 1 && numberFrom(ctx, "p1") > 0.96,
        successMessage: "The X gate moved all probability from |0> to |1>.", explanation: "The histogram is evidence of the state after the inspected circuit columns.", hint: "Clear the circuit, choose one qubit, select X, then click the first wire.",
      },
      {
        id: "superposition", title: "Create superposition", question: "Which gate creates two equally likely outcomes?",
        instruction: "Build or load a one-qubit H circuit.", focusControl: "examples", focusVisual: "probabilities",
        completion: (ctx) => numberFrom(ctx, "numQubits") === 1 && Math.abs(numberFrom(ctx, "p0") - 0.5) < 0.06,
        successMessage: "H created equal measurement probabilities for |0> and |1>.", explanation: "Equal bars show probability balance; the amplitudes retain phase information too.", hint: "The Superposition example loads a single H gate.",
      },
      {
        id: "interference", title: "Undo through interference", question: "Can a second H remove the visible superposition?",
        instruction: "Place two H gates on the same wire in successive columns.", focusControl: "gate-palette", focusVisual: "circuit",
        completion: (ctx) => numberFrom(ctx, "numQubits") === 1 && numberFrom(ctx, "gateCount") >= 2 && numberFrom(ctx, "p0") > 0.96,
        successMessage: "The second H recombined amplitudes so |0> became certain again.", explanation: "Quantum gates transform amplitudes, so paths can reinforce or cancel.", hint: "Clear, select H, then place it in columns 1 and 2 on q0.",
      },
      {
        id: "bell", title: "Build a Bell state", question: "How can two qubits become correlated?",
        instruction: "Load or build H followed by CNOT on two qubits.", focusControl: "examples", focusVisual: "probabilities",
        completion: (ctx) => numberFrom(ctx, "numQubits") === 2 && boolFrom(ctx, "hasCnot") && numberFrom(ctx, "bellWeight") > 0.96 && numberFrom(ctx, "supportCount") === 2,
        successMessage: "Only |00> and |11> remain: the outcomes are correlated, not independently random.", explanation: "Correlation is the key evidence; each qubit alone looks uncertain, but their outcomes agree.", hint: "Load the Bell example and inspect through the final gate column.",
      },
      {
        id: "distribution", title: "Distribution challenge", question: "Can a larger circuit keep probability on a small correlated set?",
        instruction: "Create or load a three-qubit circuit with at least three gates and two populated outcomes.", focusControl: "examples", focusVisual: "probabilities",
        completion: (ctx) => numberFrom(ctx, "numQubits") >= 3 && numberFrom(ctx, "gateCount") >= 3 && numberFrom(ctx, "supportCount") >= 2,
        successMessage: "The circuit created a structured multi-qubit distribution.", explanation: "The number and placement of nonzero outcomes reveals how gate structure shapes joint behavior.", hint: "The GHZ example is a direct route.",
      },
    ],
    conclusion: {
      takeaway: "Circuit columns transform amplitudes step by step, and the final distribution records their interference and correlation.",
      evidence: (ctx) => `Your inspected circuit uses ${numberFrom(ctx, "gateCount")} gates over ${numberFrom(ctx, "numQubits")} qubits.`,
      equation: "|psi_out> = U_n ... U_2 U_1 |psi_in>", nextLab: "Next: train circuit parameters in the VQC Lab.", nextLabHref: "/lab/vqc",
    },
  },
  modelScope: "This is an exact, noiseless statevector simulation for up to four qubits. It does not model shots, hardware errors, or device connectivity.",
  definitions: [
    { term: "Amplitude", meaning: "A complex coefficient whose squared magnitude gives a measurement probability." },
    { term: "Interference", meaning: "Amplitude contributions combine constructively or destructively before measurement." },
    { term: "Entanglement", meaning: "A joint state that cannot be described as independent states for each qubit." },
  ],
  researchNotes: ["Use the column inspector to compare intermediate statevectors.", "The simulator applies gates in column order with deterministic floating-point arithmetic."],
  screenReaderSummary: (ctx) => `${numberFrom(ctx, "numQubits")} qubits and ${numberFrom(ctx, "gateCount")} gates; ${numberFrom(ctx, "supportCount")} outcomes have visible probability.`,
  insights: [
    {
      id: "empty",
      tag: "tip",
      headline: "Start with one gate",
      body: "An empty circuit stays in |0...0>. Add H to create visible probability spread.",
      condition: (ctx) => numberFrom(ctx, "gateCount") === 0,
    },
    {
      id: "entangling",
      tag: "discovery",
      headline: "Controlled gate in play",
      body: "CNOT can correlate wires so outcomes are no longer explainable one qubit at a time.",
      condition: (ctx) => boolFrom(ctx, "hasCnot"),
      priority: 2,
    },
  ],
  observe: (ctx) => `${numberFrom(ctx, "numQubits")} qubits, ${numberFrom(ctx, "gateCount")} placed gates.`,
};

export const VQC_NARRATIVE: NarrativeConfig = {
  labSlug: "vqc",
  hook: {
    analogy: "A variational classifier is a small adjustable lens: training turns the lens until classes separate.",
    question: "How do depth, learning rate, and data shape affect the decision boundary?",
    invitation: "Train for a few epochs, pause, then step manually to see how loss and boundary co-evolve.",
  },
  mission: {
    title: "Teach a quantum model", estimatedMinutes: 10, difficulty: "Advanced",
    steps: [
      { id: "dataset", title: "Read the dataset", instruction: "Choose a dataset and inspect where its classes overlap.", focusControl: "dataset", focusVisual: "decision-boundary", completion: (ctx) => stringFrom(ctx, "datasetSlug").length > 0, successMessage: "You identified the geometry the classifier must learn.", explanation: "The point layout sets the classification problem before training begins." },
      { id: "one-step", title: "Watch one update", instruction: "Reset, then press Step once.", focusControl: "training", focusVisual: "loss-curve", completion: (ctx) => numberFrom(ctx, "epoch") >= 1, successMessage: "One parameter update produced a measured loss and a new model state.", explanation: "The parameter-shift gradient links circuit evaluations to the weight update.", hint: "Use Reset and then Step." },
      { id: "rate", title: "Test the learning rate", instruction: "Choose a rate below 0.15 or above 0.8, then run at least two steps.", focusControl: "learning-rate", focusVisual: "loss-curve", completion: (ctx) => numberFrom(ctx, "epoch") >= 2 && (numberFrom(ctx, "learningRate") < 0.15 || numberFrom(ctx, "learningRate") > 0.8), successMessage: "The loss trace now reflects a deliberately cautious or aggressive update size.", explanation: "Learning rate changes update size, not model capacity.", hint: "Change the rate, Reset, then Step twice." },
      { id: "capacity", title: "Change model capacity", instruction: "Use three or more layers and train the model.", focusControl: "layers", focusVisual: "decision-boundary", completion: (ctx) => numberFrom(ctx, "layers") >= 3 && numberFrom(ctx, "epoch") >= 1, successMessage: "Additional layers changed the parameterized boundary family.", explanation: "More layers add trainable freedom but can also make optimization harder." },
      { id: "accuracy", title: "Accuracy challenge", instruction: "Tune and train until accuracy reaches at least 80%.", focusControl: "training", focusVisual: "decision-boundary", completion: (ctx) => numberFrom(ctx, "accuracy") >= 0.8, successMessage: "The current model classifies at least four out of five training points correctly.", explanation: "Training accuracy is evidence on this generated dataset, not proof of generalization.", hint: "Try two or three layers with a moderate rate around 0.3 to 0.5." },
    ],
    conclusion: { takeaway: "Training connects circuit parameters, gradient-based updates, loss, and the visible decision boundary.", evidence: (ctx) => `After ${numberFrom(ctx, "epoch")} epochs, loss is ${numberFrom(ctx, "loss").toFixed(4)} and training accuracy is ${(numberFrom(ctx, "accuracy") * 100).toFixed(1)}%.`, equation: "theta <- theta - eta * grad L(theta)", nextLab: "Next: investigate vanishing training signals in Barren Plateau.", nextLabHref: "/lab/barren-plateau" },
  },
  modelScope: "This educational two-qubit classifier uses generated training data and noiseless browser simulation. It makes no claim of quantum advantage or test-set generalization.",
  definitions: [{ term: "Loss", meaning: "A scalar penalty measuring disagreement between model predictions and labels." }, { term: "Learning rate", meaning: "The multiplier controlling each parameter update's size." }, { term: "Decision boundary", meaning: "The set of inputs where the model is equally uncertain between classes." }],
  researchNotes: ["Seed and layer count make initialization reproducible.", "Accuracy shown here is training accuracy on a small generated dataset."],
  screenReaderSummary: (ctx) => `Epoch ${numberFrom(ctx, "epoch")}; loss ${numberFrom(ctx, "loss").toFixed(4)}; accuracy ${(numberFrom(ctx, "accuracy") * 100).toFixed(1)} percent.`,
  insights: [
    {
      id: "accurate",
      tag: "milestone",
      headline: "High accuracy reached",
      body: "The current parameters separate most training points. Try reducing layers to see if the model still holds.",
      condition: (ctx) => numberFrom(ctx, "accuracy") >= 0.85,
      priority: 3,
    },
    {
      id: "learning",
      tag: "discovery",
      headline: "Training is underway",
      body: "Loss is the feedback signal; the parameter-shift rule turns it into updates for circuit angles.",
      condition: (ctx) => numberFrom(ctx, "epoch") > 0,
    },
  ],
  observe: (ctx) =>
    `Epoch ${numberFrom(ctx, "epoch")} with loss ${numberFrom(ctx, "loss").toFixed(4)} and accuracy ${numberFrom(ctx, "accuracy").toFixed(3)}.`,
};

export const VQE_NARRATIVE: NarrativeConfig = {
  labSlug: "vqe-h2",
  hook: {
    analogy: "VQE is tuning an instrument until the molecule's energy note is as low as possible.",
    question: "How does a single ansatz angle approximate the ground-state energy of H2?",
    invitation: "Move theta by hand first, then press Optimize and compare the exact reference.",
  },
  mission: {
    title: "Find the molecule's lowest energy", estimatedMinutes: 9, difficulty: "Advanced",
    steps: [
      { id: "stretch", title: "Stretch the molecule", instruction: "Move the bond length beyond 1.2 angstrom and observe the energy surfaces.", focusControl: "bond-length", focusVisual: "pes", completion: (ctx) => numberFrom(ctx, "bondLength") > 1.2, successMessage: "Changing nuclear separation moved the molecular energy landscape.", explanation: "Bond length selects a different Hamiltonian and therefore a different ground-state problem." },
      { id: "manual", title: "Search the ansatz manually", instruction: "Move theta away from its starting value and look for a low point.", focusControl: "theta", focusVisual: "energy-theta", completion: (ctx) => numberFrom(ctx, "theta") > 0.35, successMessage: "Theta selected a different trial state and changed its expected energy.", explanation: "The curve maps one ansatz parameter to an energy expectation." },
      { id: "optimize", title: "Run optimization", instruction: "Press Optimize and inspect the selected minimum.", focusControl: "optimize", focusVisual: "energy-theta", completion: (ctx) => boolFrom(ctx, "optimized"), successMessage: "The optimizer followed the model's energy signal to a lower trial state.", explanation: "VQE minimizes an expectation value within the available ansatz family." },
      { id: "equilibrium", title: "Find equilibrium", instruction: "Move the bond length near 0.735 angstrom.", focusControl: "bond-length", focusVisual: "pes", completion: (ctx) => Math.abs(numberFrom(ctx, "bondLength") - 0.735) < 0.06, successMessage: "The cursor is near the model's equilibrium bond length.", explanation: "The minimum of the potential energy surface estimates the stable separation." },
      { id: "accuracy", title: "Accuracy challenge", instruction: "Optimize until the VQE error is below 0.02 Hartree.", focusControl: "optimize", focusVisual: "energy-theta", completion: (ctx) => numberFrom(ctx, "error", 1) < 0.02, successMessage: "The variational estimate is within 0.02 Hartree of exact diagonalization for this model.", explanation: "The exact line is a model-internal benchmark, not an experimental measurement." },
    ],
    conclusion: { takeaway: "VQE searches a restricted trial-state landscape while bond length changes the Hamiltonian itself.", evidence: (ctx) => `At R = ${numberFrom(ctx, "bondLength").toFixed(2)} angstrom, the displayed error is ${numberFrom(ctx, "error").toFixed(6)} Hartree.`, equation: "E(theta, R) = <psi(theta)|H(R)|psi(theta)>", nextLab: "Next: see how optimization signals can vanish in Barren Plateau.", nextLabHref: "/lab/barren-plateau" },
  },
  modelScope: "This is a self-constructed educational H2 model with tabulated approximate coefficients, a minimal basis, two-qubit reduction, one-parameter ansatz, and noiseless optimization. It is not an ab initio chemistry result.",
  definitions: [{ term: "Hamiltonian", meaning: "The operator encoding the model's energy terms at a selected bond length." }, { term: "Ansatz", meaning: "A parameterized family of trial quantum states searched by VQE." }, { term: "Variational bound", meaning: "A trial state's expected energy cannot be below the exact ground energy of the same modeled Hamiltonian." }],
  researchNotes: ["Exact means exact diagonalization of this approximate two-qubit Hamiltonian.", "The browser optimizer is deterministic and does not include shot noise."],
  screenReaderSummary: (ctx) => `Bond length ${numberFrom(ctx, "bondLength").toFixed(2)} angstrom; energy ${numberFrom(ctx, "currentEnergy").toFixed(5)} Hartree; error ${numberFrom(ctx, "error").toFixed(5)}.`,
  insights: [
    {
      id: "low-error",
      tag: "milestone",
      headline: "Close to the exact energy",
      body: "The variational state is now near the exact model for this bond length.",
      condition: (ctx) => numberFrom(ctx, "error", 1) < 0.02,
      priority: 3,
    },
    {
      id: "stretched",
      tag: "warning",
      headline: "Stretched bond",
      body: "Longer bond lengths make the potential surface flatter and the optimization signal subtler.",
      condition: (ctx) => numberFrom(ctx, "bondLength") > 1.5,
    },
  ],
  observe: (ctx) =>
    `R = ${numberFrom(ctx, "bondLength").toFixed(2)} A, E(theta) = ${numberFrom(ctx, "currentEnergy").toFixed(5)}.`,
};

export const QUBO_NARRATIVE: NarrativeConfig = {
  labSlug: "qubo",
  hook: {
    analogy: "A QUBO is a scoreboard for yes/no choices: every bitstring gets an energy score.",
    question: "How do diagonal rewards and pairwise penalties shape the best binary decision?",
    invitation: "Edit one matrix cell and watch which bitstring becomes the best solution.",
  },
  mission: {
    title: "Turn decisions into energy", estimatedMinutes: 9, difficulty: "Intermediate",
    steps: [
      { id: "binary", title: "Read binary decisions", instruction: "Choose a template and connect each bit to its named decision.", focusControl: "template", focusVisual: "energy-ranking", completion: (ctx) => stringFrom(ctx, "templateSlug").length > 0, successMessage: "Each ranked bitstring is now a complete yes/no decision assignment.", explanation: "A QUBO gives every assignment an energy score." },
      { id: "interaction", title: "Change an interaction", instruction: "Edit an upper-triangle matrix cell and observe the winning bitstring or energy.", focusControl: "matrix", focusVisual: "qubo-matrix", completion: (ctx) => boolFrom(ctx, "matrixEdited"), successMessage: "Changing one coefficient reshaped the energy assigned to related decisions.", explanation: "Diagonal terms score individual bits; off-diagonal terms score pairs.", hint: "Change any enabled matrix input by at least 0.5." },
      { id: "constraint", title: "Add a constraint", instruction: "Require an exact selected count.", focusControl: "constraint", focusVisual: "energy-ranking", completion: (ctx) => numberFrom(ctx, "requiredCount", -1) >= 0, successMessage: "The ranking now labels solutions by feasibility as well as energy.", explanation: "Feasibility is a separate fact from the unconstrained QUBO energy." },
      { id: "penalty", title: "Observe penalty failure", instruction: "Keep penalty low and choose a count for which the lowest-energy assignment is infeasible.", focusControl: "penalty", focusVisual: "energy-ranking", completion: (ctx) => numberFrom(ctx, "penaltyStrength") <= 1 && !boolFrom(ctx, "bestFeasible", true), successMessage: "The weak penalty let an infeasible assignment retain the lowest total energy.", explanation: "A weak or absent penalty lets infeasible assignments win.", hint: "Try a required count far from the number of 1s in the current best bitstring." },
      { id: "compare", title: "Tune the penalty", instruction: "Raise penalty until a feasible assignment wins the exact ranking.", focusControl: "penalty", focusVisual: "energy-ranking", completion: (ctx) => numberFrom(ctx, "penaltyStrength") > 1 && boolFrom(ctx, "bestFeasible"), successMessage: "The encoded penalty is now strong enough for a feasible assignment to win.", explanation: "Penalty choice changes the optimization landscape and must dominate the benefit of violating the rule." },
    ],
    conclusion: { takeaway: "QUBO modeling links named binary decisions, matrix coefficients, feasibility, and an energy-ranked solution space.", evidence: (ctx) => `The best raw assignment is ${stringFrom(ctx, "bestBits")} with energy ${numberFrom(ctx, "bestEnergy").toFixed(2)} and is ${boolFrom(ctx, "bestFeasible") ? "feasible" : "infeasible"}.`, equation: "min_x x^T Q x,  x_i in {0,1}", nextLab: "Next: search rugged energy landscapes with Annealing.", nextLabHref: "/lab/annealing" },
  },
  modelScope: "Exact enumeration is used for these small browser instances; the greedy result is a deterministic local-search baseline. No claim is made about large-scale performance.",
  definitions: [{ term: "QUBO", meaning: "A quadratic objective over binary variables with no explicit constraints." }, { term: "Penalty", meaning: "An added energy term intended to make rule violations unattractive." }, { term: "Feasible", meaning: "An assignment satisfying the selected real-world rule, independent of its raw objective energy." }],
  researchNotes: ["Only diagonal and upper-triangle entries contribute in this representation.", "CSV export contains the full exact ranking and feasibility labels."],
  screenReaderSummary: (ctx) => `Best bitstring ${stringFrom(ctx, "bestBits")}, energy ${numberFrom(ctx, "bestEnergy").toFixed(2)}, ${boolFrom(ctx, "bestFeasible") ? "feasible" : "infeasible"}.`,
  insights: [
    {
      id: "infeasible-best",
      tag: "warning",
      headline: "Best energy violates the count rule",
      body: "The unconstrained objective wants a different number of selected variables. Penalties or constraints need tuning.",
      condition: (ctx) => !boolFrom(ctx, "bestFeasible", true),
      priority: 3,
    },
    {
      id: "greedy-match",
      tag: "milestone",
      headline: "Greedy found the exact best",
      body: "The local-search baseline landed on the same bitstring as exhaustive search for this small QUBO.",
      condition: (ctx) => stringFrom(ctx, "bestBits") === stringFrom(ctx, "greedyBits"),
    },
  ],
  observe: (ctx) =>
    `Best bitstring ${stringFrom(ctx, "bestBits")} has energy ${numberFrom(ctx, "bestEnergy").toFixed(2)}.`,
};

export const ANNEALING_NARRATIVE: NarrativeConfig = {
  labSlug: "annealing",
  hook: {
    analogy: "Annealing is hiking in fog while the weather cools: early wandering helps escape valleys, later steps settle.",
    question: "How does temperature decide whether the search accepts a worse move?",
    invitation: "Raise initial temperature, slow the cooling rate, and scrub the trace slider.",
  },
  mission: {
    title: "Escape the false valley", estimatedMinutes: 9, difficulty: "Intermediate",
    steps: [
      { id: "greedy", title: "Freeze the search", instruction: "Set initial temperature below 0.4 and use the double-well landscape.", focusControl: "temperature", focusVisual: "landscape", completion: (ctx) => numberFrom(ctx, "initialTemperature") < 0.4 && stringFrom(ctx, "landscapeSlug") === "double-well", successMessage: "The nearly frozen run has little ability to cross uphill barriers.", explanation: "Low temperature makes worse moves exponentially unlikely." },
      { id: "explore", title: "Allow exploration", instruction: "Raise initial temperature above 3 and inspect accepted moves.", focusControl: "temperature", focusVisual: "landscape", completion: (ctx) => numberFrom(ctx, "initialTemperature") > 3 && numberFrom(ctx, "acceptedRatio") > 0.35, successMessage: "The hotter run accepted enough moves to explore beyond its current basin.", explanation: "Early uphill moves trade short-term energy for access to other valleys." },
      { id: "cool", title: "Control cooling", instruction: "Set cooling below 0.96 and move the trace from early to late steps.", focusControl: "cooling", focusVisual: "best-trace", completion: (ctx) => numberFrom(ctx, "coolingRate") < 0.96 && numberFrom(ctx, "step") > 30, successMessage: "Temperature now falls fast enough to visibly shift from exploration toward settling.", explanation: "The cooling rate controls how long uphill acceptance remains plausible." },
      { id: "minimum", title: "Find the global basin", instruction: "Tune temperature and cooling until best energy reaches the lowest 10% of the plotted range.", focusControl: "cooling", focusVisual: "landscape", completion: (ctx) => numberFrom(ctx, "bestEnergyRatio", 1) < 0.1, successMessage: "The run reached the plotted landscape's best basin.", explanation: "Success is measured against the sampled landscape, not guaranteed by the method." },
      { id: "repeat", title: "Test repeatability", instruction: "Change the seed and compare the final best energy.", focusControl: "trace", focusVisual: "best-trace", completion: (ctx) => numberFrom(ctx, "seed") !== 7, successMessage: "A new seed produced a second stochastic trajectory for comparison.", explanation: "Repeated seeded trials reveal outcome variability that one run hides." },
    ],
    conclusion: { takeaway: "Temperature governs the probability of accepting uphill moves, while cooling determines when exploration gives way to exploitation.", evidence: (ctx) => `This run accepted ${Math.round(numberFrom(ctx, "acceptedRatio") * 100)}% of proposals and reached best energy ${numberFrom(ctx, "bestEnergy").toFixed(3)}.`, equation: "P(accept uphill) = exp(-Delta E / T)", nextLab: "Next: formulate a decision landscape in QUBO Solver.", nextLabHref: "/lab/qubo" },
  },
  modelScope: "This is classical simulated annealing on small one-dimensional synthetic landscapes. It is not quantum annealing and does not guarantee a global optimum.",
  definitions: [{ term: "Temperature", meaning: "A search parameter controlling tolerance for uphill energy moves." }, { term: "Acceptance", meaning: "Whether a proposed move becomes the next state." }, { term: "Cooling schedule", meaning: "The rule that lowers temperature as the run progresses." }],
  researchNotes: ["Seeded pseudo-randomness makes each configured run reproducible.", "The displayed best is compared with the fully sampled one-dimensional landscape."],
  screenReaderSummary: (ctx) => `Step ${numberFrom(ctx, "step")}; temperature ${numberFrom(ctx, "temperature").toFixed(3)}; current energy ${numberFrom(ctx, "currentEnergy").toFixed(3)}; best ${numberFrom(ctx, "bestEnergy").toFixed(3)}.`,
  insights: [
    {
      id: "many-accepted",
      tag: "discovery",
      headline: "Lots of exploration",
      body: "A high acceptance ratio means the search is still willing to move across the landscape.",
      condition: (ctx) => numberFrom(ctx, "acceptedRatio") > 0.65,
    },
    {
      id: "near-min",
      tag: "milestone",
      headline: "Near the best basin",
      body: "The current best energy is close to the lowest sampled region of the landscape.",
      condition: (ctx) => numberFrom(ctx, "bestEnergyRatio", 1) < 0.12,
      priority: 2,
    },
  ],
  observe: (ctx) =>
    `Step ${numberFrom(ctx, "step")} at T = ${numberFrom(ctx, "temperature").toFixed(3)}; accepted ${Math.round(
      numberFrom(ctx, "acceptedRatio") * 100
    )}%.`,
};

export const KERNEL_NARRATIVE: NarrativeConfig = {
  labSlug: "quantum-kernel",
  hook: {
    analogy: "A kernel is a similarity microscope: it decides which points look close after feature mapping.",
    question: "When does a quantum-style feature map align better with labels than an RBF kernel?",
    invitation: "Switch kernels and tune depth or gamma while watching the alignment readout.",
  },
  mission: {
    title: "Redraw similarity", estimatedMinutes: 9, difficulty: "Advanced",
    steps: [
      { id: "read", title: "Read a similarity matrix", instruction: "Choose a dataset and inspect diagonal versus off-diagonal cells.", focusControl: "dataset", focusVisual: "kernel-matrix", completion: (ctx) => numberFrom(ctx, "alignment") > 0, successMessage: "The matrix encodes pairwise similarity, with self-similarity on the diagonal.", explanation: "Each cell compares one data point with another under the selected feature map." },
      { id: "compare", title: "Compare kernel families", instruction: "Switch to RBF and compare both alignment readouts.", focusControl: "kernel", focusVisual: "kernel-matrix", completion: (ctx) => stringFrom(ctx, "kernelKind") === "rbf", successMessage: "You made a direct comparison between classical RBF and the quantum-style feature map.", explanation: "Different kernels redraw which inputs count as similar." },
      { id: "gamma", title: "Tune RBF gamma", instruction: "Move gamma below 0.3 or above 1.5 while RBF is selected.", focusControl: "gamma", focusVisual: "kernel-matrix", completion: (ctx) => stringFrom(ctx, "kernelKind") === "rbf" && (numberFrom(ctx, "gamma") < 0.3 || numberFrom(ctx, "gamma") > 1.5), successMessage: "Gamma changed the distance scale at which RBF similarity decays.", explanation: "Large gamma narrows neighborhoods; small gamma makes similarity broader." },
      { id: "depth", title: "Tune feature depth", instruction: "Select the quantum kernel and use a depth other than 2.", focusControl: "depth", focusVisual: "kernel-matrix", completion: (ctx) => stringFrom(ctx, "kernelKind") === "quantum" && numberFrom(ctx, "depth") !== 2, successMessage: "Feature depth changed the quantum-style similarity geometry.", explanation: "Depth modifies this simulated feature map; more depth is not automatically better." },
      { id: "alignment", title: "Alignment challenge", instruction: "Tune either kernel until selected alignment reaches at least 0.45.", focusControl: "kernel", focusVisual: "kernel-matrix", completion: (ctx) => numberFrom(ctx, "alignment") >= 0.45, successMessage: "The selected similarity matrix now agrees strongly with this dataset's labels.", explanation: "Alignment is a descriptive training-set statistic, not a guarantee of classifier accuracy or quantum advantage.", hint: "Compare datasets as well as depth or gamma." },
    ],
    conclusion: { takeaway: "A kernel changes the geometry of similarity, and alignment measures how that geometry agrees with labels.", evidence: (ctx) => `${stringFrom(ctx, "kernelKind")} alignment is ${numberFrom(ctx, "alignment").toFixed(3)}; quantum minus RBF is ${numberFrom(ctx, "comparisonGap").toFixed(3)}.`, equation: "K(x,y) = |<phi(x)|phi(y)>|^2", nextLab: "Next: use a trainable quantum model in VQC.", nextLabHref: "/lab/vqc" },
  },
  modelScope: "The quantum option is a noiseless browser-simulated feature map. Alignment is computed on generated data and does not establish quantum advantage or out-of-sample performance.",
  definitions: [{ term: "Kernel", meaning: "A function that returns a similarity score for two inputs." }, { term: "Feature map", meaning: "A transformation that represents inputs in a space where similarity is measured." }, { term: "Kernel alignment", meaning: "A normalized agreement score between the similarity matrix and same-class labels." }],
  researchNotes: ["Quantum and RBF matrices use the same generated points for direct comparison.", "Alignment should be evaluated alongside validation performance in real model selection."],
  screenReaderSummary: (ctx) => `${stringFrom(ctx, "kernelKind")} kernel alignment ${numberFrom(ctx, "alignment").toFixed(3)} at depth ${numberFrom(ctx, "depth")} and gamma ${numberFrom(ctx, "gamma").toFixed(2)}.`,
  insights: [
    {
      id: "quantum-better",
      tag: "discovery",
      headline: "Quantum map is aligning better",
      body: "For this setting, the feature-map kernel agrees with label similarity more than the RBF baseline.",
      condition: (ctx) => numberFrom(ctx, "quantumAlignment") > numberFrom(ctx, "rbfAlignment") + 0.03,
      priority: 2,
    },
    {
      id: "rbf-better",
      tag: "tip",
      headline: "Classical baseline is strong here",
      body: "The RBF kernel can still be the better similarity function for simple geometric datasets.",
      condition: (ctx) => numberFrom(ctx, "rbfAlignment") > numberFrom(ctx, "quantumAlignment") + 0.03,
    },
  ],
  observe: (ctx) =>
    `${stringFrom(ctx, "kernelKind", "kernel")} alignment is ${numberFrom(ctx, "alignment").toFixed(3)}.`,
};

export const BARREN_NARRATIVE: NarrativeConfig = {
  labSlug: "barren-plateau",
  hook: {
    analogy: "A barren plateau is a volume knob stuck near silence: gradients become too small to guide learning.",
    question: "Why do global costs lose gradient signal as qubit count and depth grow?",
    invitation: "Compare global and local costs at the same width, then increase depth.",
  },
  mission: {
    title: "When the learning signal disappears", estimatedMinutes: 8, difficulty: "Advanced",
    steps: [
      { id: "healthy", title: "Start with a healthy signal", instruction: "Use at most three qubits and shallow depth.", focusControl: "qubits", focusVisual: "gradient-samples", completion: (ctx) => numberFrom(ctx, "qubits") <= 3 && numberFrom(ctx, "depth") <= 8, successMessage: "The modeled gradients retain a visibly broad distribution.", explanation: "Larger gradient spread gives an optimizer a stronger directional signal." },
      { id: "width", title: "Increase width", instruction: "Raise the global-cost circuit to at least eight qubits.", focusControl: "qubits", focusVisual: "variance-trend", completion: (ctx) => numberFrom(ctx, "qubits") >= 8 && stringFrom(ctx, "scope") === "global", successMessage: "The log-scale variance fell sharply as width increased.", explanation: "This conceptual global-cost model encodes exponential variance decay with width." },
      { id: "scope", title: "Compare cost scope", instruction: "Switch from global to local cost at high width.", focusControl: "scope", focusVisual: "variance-trend", completion: (ctx) => numberFrom(ctx, "qubits") >= 8 && stringFrom(ctx, "scope") === "local", successMessage: "The local-cost trend decays more gently in this model.", explanation: "Cost locality can preserve trainability, though it does not remove every optimization difficulty." },
      { id: "depth", title: "Increase depth", instruction: "Set depth to at least 20 and inspect the sampled gradients.", focusControl: "depth", focusVisual: "gradient-samples", completion: (ctx) => numberFrom(ctx, "depth") >= 20, successMessage: "Greater depth further compressed the modeled gradient scale.", explanation: "Highly expressive random circuits can concentrate behavior and weaken local training signals." },
      { id: "design", title: "Design a trainable configuration", instruction: "Use local cost, six or fewer qubits, and depth below 12.", focusControl: "scope", focusVisual: "variance-trend", completion: (ctx) => stringFrom(ctx, "scope") === "local" && numberFrom(ctx, "qubits") <= 6 && numberFrom(ctx, "depth") < 12, successMessage: "Your configuration preserves a stronger modeled gradient signal.", explanation: "Problem-informed, local, shallower designs can be easier to train than random global alternatives." },
    ],
    conclusion: { takeaway: "Trainability depends on circuit scale, depth, and cost design; expressivity alone is not the goal.", evidence: (ctx) => `The conceptual model gives variance ${numberFrom(ctx, "variance").toExponential(2)} for ${numberFrom(ctx, "qubits")} qubits, depth ${numberFrom(ctx, "depth")}, and ${stringFrom(ctx, "scope")} cost.`, equation: "Var[dC/dtheta] -> 0 as scale increases", nextLab: "Next: return to VQC and watch the optimizer use a real loss signal.", nextLabHref: "/lab/vqc" },
  },
  modelScope: "This page is a seeded conceptual statistical model of barren-plateau trends, not a full quantum-circuit simulation or empirical theorem check. Values illustrate expected qualitative scaling only.",
  definitions: [{ term: "Gradient variance", meaning: "How broadly gradient values vary across random parameter samples." }, { term: "Barren plateau", meaning: "A region where gradients concentrate near zero, making optimization direction difficult to detect." }, { term: "Log scale", meaning: "An axis where equal spacing represents multiplication, used here to reveal changes across many orders of magnitude." }],
  researchNotes: ["The global and local curves are explicit educational scaling models.", "Real trainability also depends on initialization, ansatz structure, data, noise, and optimizer."],
  screenReaderSummary: (ctx) => `${numberFrom(ctx, "qubits")} qubits, depth ${numberFrom(ctx, "depth")}, ${stringFrom(ctx, "scope")} cost, modeled variance ${numberFrom(ctx, "variance").toExponential(2)}.`,
  insights: [
    {
      id: "global-wide",
      tag: "warning",
      headline: "Global cost is fading",
      body: "At this width, global cost gradients are exponentially suppressed in the model.",
      condition: (ctx) => stringFrom(ctx, "scope") === "global" && numberFrom(ctx, "qubits") >= 8,
      priority: 3,
    },
    {
      id: "local-cost",
      tag: "tip",
      headline: "Local costs preserve more signal",
      body: "Local objectives usually degrade more gently, which is why cost design matters.",
      condition: (ctx) => stringFrom(ctx, "scope") === "local",
    },
  ],
  observe: (ctx) =>
    `${numberFrom(ctx, "qubits")} qubits, depth ${numberFrom(ctx, "depth")}, variance ${numberFrom(ctx, "variance").toExponential(2)}.`,
};
