import { ArrowRight, FlaskConical, GraduationCap, LineChart, Target } from "lucide-react";
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

export default function LabPage() {
  const liveCount = labTools.filter((tool) => tool.status === "published").length;
  const plannedCount = labTools.length - liveCount;

  return (
    <PageShell
      eyebrow="Interactive Lab"
      title="Explore quantum ideas by changing the system yourself"
      description="A hands-on workspace for quantum states, circuits, variational models, optimization, kernels, and trainability experiments."
      path="/lab"
    >
      <div className="grid gap-4 border-y border-border py-6 sm:grid-cols-3">
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
      </div>

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
