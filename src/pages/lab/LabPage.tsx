import { useEffect, useState } from "react";
import { ArrowRight, Check, FlaskConical, GraduationCap, LineChart, Route, Target } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.tsx";
import { labTools } from "../../data/labTools.ts";

const STATUS_LABELS = {
  published: "Live",
  "coming-soon": "Planned",
} as const;

const LAB_MODES = [
  {
    icon: GraduationCap,
    title: "Educational mode",
    description: "Guided language, presets, and explanations for first-pass intuition.",
  },
  {
    icon: LineChart,
    title: "Research mode",
    description: "Precise controls, repeatable seeds, readouts, and export-ready results.",
  },
  {
    icon: Target,
    title: "Challenge mode",
    description: "Goal-driven tasks that turn each concept into a measurable exercise.",
  },
];

const LEARNING_PATHS = [
  {
    title: "Build quantum intuition",
    description: "Move from one-qubit geometry to interference and entanglement.",
    slugs: ["bloch-sphere", "circuit"],
  },
  {
    title: "Learn variational algorithms",
    description: "Connect parameterized circuits, optimization signals, and trainability.",
    slugs: ["vqc", "vqe-h2", "barren-plateau"],
  },
  {
    title: "Explore optimization",
    description: "Translate binary decisions into energy, then search a rugged landscape.",
    slugs: ["qubo", "annealing"],
  },
  {
    title: "Explore QML geometry",
    description: "Redraw similarity with feature maps, then train a decision boundary.",
    slugs: ["quantum-kernel", "vqc"],
  },
];

export default function LabPage() {
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const liveCount = labTools.filter((tool) => tool.status === "published").length;
  const plannedCount = labTools.length - liveCount;
  const completedCount = completedSlugs.size;

  useEffect(() => {
    const readProgress = () => {
      const completed = new Set<string>();
      labTools.forEach((tool) => {
        const raw = window.localStorage.getItem(`mrama.lab.${tool.slug}.progress`);
        if (!raw) return;
        try {
          if ((JSON.parse(raw) as { completed?: boolean }).completed) completed.add(tool.slug);
        } catch {
          // Ignore malformed local progress and leave the Lab available.
        }
      });
      setCompletedSlugs(completed);
    };
    readProgress();
    window.addEventListener("storage", readProgress);
    window.addEventListener("mrama:lab-learning", readProgress);
    return () => {
      window.removeEventListener("storage", readProgress);
      window.removeEventListener("mrama:lab-learning", readProgress);
    };
  }, []);

  return (
    <PageShell
      eyebrow="Interactive Lab"
      title="Explore quantum ideas by changing the system yourself"
      description="A hands-on workspace for quantum states, circuits, variational models, optimization, kernels, and trainability experiments."
      path="/lab"
    >
      <div className="grid gap-4 border-y border-border py-6 sm:grid-cols-4">
        <div>
          <p className="eyebrow">Live tools</p>
          <p className="mt-2 text-h2 text-text-primary">{liveCount}</p>
        </div>
        <div>
          <p className="eyebrow">Planned tools</p>
          <p className="mt-2 text-h2 text-text-primary">{plannedCount}</p>
        </div>
        <div>
          <p className="eyebrow">Learning modes</p>
          <p className="mt-2 text-h2 text-text-primary">3</p>
        </div>
        <div>
          <p className="eyebrow">Completed</p>
          <p className="mt-2 text-h2 text-text-primary">{completedCount} / {liveCount}</p>
        </div>
      </div>

      <section className="mt-12 border-b border-border pb-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Learning paths</p>
            <h2 className="mt-3 text-h2 text-text-primary">Choose a scientific question</h2>
          </div>
          <Route className="hidden text-accent md:block" size={26} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {LEARNING_PATHS.map((path) => {
            const pathTools = path.slugs.map((slug) => labTools.find((tool) => tool.slug === slug)).filter(Boolean);
            const pathCompleted = path.slugs.filter((slug) => completedSlugs.has(slug)).length;
            return (
              <article key={path.title} className="border-l-2 border-border pl-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-h3 text-text-primary">{path.title}</h3>
                    <p className="mt-2 text-small text-text-secondary">{path.description}</p>
                  </div>
                  <span className="shrink-0 font-mono text-mono-label uppercase text-text-muted">{pathCompleted}/{path.slugs.length}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {pathTools.map((tool, index) => tool && (
                    <div key={tool.slug} className="flex items-center gap-2">
                      <Link to={`/lab/${tool.slug}`} className="inline-flex items-center gap-1.5 text-small font-medium text-text-primary hover:text-accent">
                        {completedSlugs.has(tool.slug) && <Check size={14} className="text-accent" aria-label="Completed" />}
                        {tool.name}
                      </Link>
                      {index < pathTools.length - 1 && <ArrowRight size={13} className="text-text-muted" aria-hidden="true" />}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <div className="grid gap-4 md:grid-cols-3">
          {LAB_MODES.map(({ icon: Icon, title, description }) => (
            <article key={title} className="glass-card p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-accent-subtle text-accent">
                <Icon size={18} />
              </div>
              <h2 className="text-h3 text-text-primary">{title}</h2>
              <p className="mt-2 text-small text-text-secondary">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Tools</p>
            <h2 className="mt-3 text-h2 text-text-primary">Lab roadmap</h2>
          </div>
          <FlaskConical className="hidden text-accent md:block" size={28} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {labTools.map((tool) => (
            <Link key={tool.slug} to={`/lab/${tool.slug}`} className="glass-card group block p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-border px-2 py-1 font-mono text-mono-label uppercase text-text-muted">
                      {tool.category}
                    </span>
                    <span className="rounded-md bg-accent-subtle px-2 py-1 font-mono text-mono-label uppercase text-accent">
                      {STATUS_LABELS[tool.status]}
                    </span>
                    {completedSlugs.has(tool.slug) && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-accent/40 px-2 py-1 font-mono text-mono-label uppercase text-accent">
                        <Check size={12} /> Complete
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-h3 text-text-primary">{tool.name}</h3>
                </div>
                <ArrowRight
                  className="mt-1 text-text-muted transition-transform duration-150 group-hover:translate-x-1 group-hover:text-accent"
                  size={18}
                />
              </div>

              <p className="mt-3 text-small text-text-secondary">{tool.description}</p>

              {tool.workflow && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {tool.workflow.slice(0, 4).map((step, index) => (
                    <span
                      key={step}
                      className="rounded-md border border-border px-2 py-1 text-small text-text-secondary"
                    >
                      {index + 1}. {step}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
