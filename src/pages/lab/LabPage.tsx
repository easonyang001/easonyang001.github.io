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

const LAB_DIRECTORY = [
  {
    title: "Fundamentals",
    description: "Bloch sphere geometry and circuit building blocks.",
    slugs: ["bloch-sphere", "circuit"],
  },
  {
    title: "Quantum AI",
    description: "Classification, kernels, and trainability in parameterized models.",
    slugs: ["vqc", "vqe-h2", "barren-plateau"],
  },
  {
    title: "Quantum Simulation",
    description: "Energy minimization, combinatorial optimization, and annealing.",
    slugs: ["qubo", "annealing"],
  },
  {
    title: "Interactive Lab",
    description: "Playable hardware recovery and a first-person lab experience.",
    slugs: ["system-recovery", "lab01-first-person"],
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
      title="Lab directory"
      description="A hands-on workspace for quantum states, circuits, variational models, optimization, kernels, and immersive lab experiments."
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
            <p className="text-small font-medium text-text-muted">Directory</p>
            <h2 className="mt-3 text-h2 text-text-primary">Choose a lab path</h2>
          </div>
          <Route className="hidden text-accent md:block" size={26} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {LAB_DIRECTORY.map((section) => {
            const sectionTools = section.slugs
              .map((slug) => labTools.find((tool) => tool.slug === slug))
              .filter(Boolean);
            const sectionCompleted = section.slugs.filter((slug) => completedSlugs.has(slug)).length;

            return (
              <article key={section.title} className="rounded-lg border border-border bg-surface/60 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-h3 text-text-primary">{section.title}</h3>
                    <p className="mt-2 text-small text-text-secondary">{section.description}</p>
                  </div>
                  <span className="shrink-0 font-mono text-mono-label uppercase text-text-muted">
                    {sectionCompleted}/{section.slugs.length}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {sectionTools.map((tool, index) => {
                    if (!tool) return null;
                    return (
                      <div key={tool.slug} className="flex items-center gap-3">
                        <span className="text-text-muted">{index < sectionTools.length - 1 ? "├─" : "└─"}</span>
                        <Link
                          to={`/lab/${tool.slug}`}
                          className="inline-flex items-center gap-1.5 text-small font-medium text-text-primary hover:text-accent"
                        >
                          {completedSlugs.has(tool.slug) && <Check size={14} className="text-accent" aria-label="Completed" />}
                          {tool.name}
                        </Link>
                      </div>
                    );
                  })}
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
            <p className="text-small font-medium text-text-muted">Tools</p>
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
