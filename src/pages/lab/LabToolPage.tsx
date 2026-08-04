import { ArrowLeft, BookOpen, Gauge, LineChart, SlidersHorizontal, Target } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../../components/PageShell.tsx";
import NotFoundPage from "../NotFoundPage.tsx";
import { labTools } from "../../data/labTools.ts";

function SectionList({
  title,
  items,
  ordered = false,
}: {
  title: string;
  items?: string[];
  ordered?: boolean;
}) {
  if (!items || items.length === 0) return null;
  const ListTag = ordered ? "ol" : "ul";

  return (
    <section className="border-t border-border pt-8">
      <h2 className="text-h3 text-text-primary">{title}</h2>
      <ListTag className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li key={item} className="flex gap-3 text-small text-text-secondary">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border font-mono text-small text-accent">
              {ordered ? index + 1 : ""}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ListTag>
    </section>
  );
}

export default function LabToolPage() {
  const { toolSlug } = useParams();
  const tool = labTools.find((t) => t.slug === toolSlug);

  if (!tool) return <NotFoundPage />;

  return (
    <PageShell
      eyebrow={tool.status === "published" ? "Published Lab" : "Planned Lab"}
      title={tool.name}
      description={tool.description}
      path={`/lab/${tool.slug}`}
    >
      <Link
        to="/lab"
        className="mb-8 inline-flex items-center gap-2 text-small font-medium text-text-secondary transition-colors duration-150 hover:text-accent"
      >
        <ArrowLeft size={15} />
        Lab roadmap
      </Link>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <SectionList title="Objectives" items={tool.objectives} />
          <SectionList title="Interactive workflow" items={tool.workflow} ordered />
          <SectionList title="Visualizations" items={tool.visualizations} />
          <SectionList title="Parameter controls" items={tool.controls} />
          <SectionList title="Mathematical focus" items={tool.mathFocus} />
          <SectionList title="Expansion roadmap" items={tool.roadmap} ordered />
        </div>

        <aside className="space-y-6">
          <div className="glass-card p-6">
            <p className="eyebrow">Status</p>
            <p className="mt-3 text-h3 text-text-primary">
              {tool.status === "published" ? "Live implementation" : "Implementation blueprint"}
            </p>
            <p className="mt-2 text-small text-text-secondary">
              {tool.status === "published"
                ? "This tool already has an interactive route. This page is reserved for future planning notes."
                : "This planning page defines the first usable build before the full interactive implementation lands."}
            </p>
          </div>

          <div className="glass-card p-6">
            <p className="eyebrow">Profile</p>
            <div className="mt-4 divide-y divide-border">
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="inline-flex items-center gap-2 text-small text-text-secondary">
                  <BookOpen size={15} />
                  Category
                </span>
                <span className="text-right text-small text-text-primary">{tool.category}</span>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="inline-flex items-center gap-2 text-small text-text-secondary">
                  <Gauge size={15} />
                  Difficulty
                </span>
                <span className="text-right text-small capitalize text-text-primary">{tool.difficulty}</span>
              </div>
            </div>
          </div>

          {tool.modes && (
            <div className="glass-card p-6">
              <p className="eyebrow">Modes</p>
              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="inline-flex items-center gap-2 text-h4 text-text-primary">
                    <BookOpen size={15} />
                    Educational
                  </h3>
                  <p className="mt-1 text-small text-text-secondary">{tool.modes.educational}</p>
                </div>
                <div>
                  <h3 className="inline-flex items-center gap-2 text-h4 text-text-primary">
                    <LineChart size={15} />
                    Research
                  </h3>
                  <p className="mt-1 text-small text-text-secondary">{tool.modes.research}</p>
                </div>
                <div>
                  <h3 className="inline-flex items-center gap-2 text-h4 text-text-primary">
                    <Target size={15} />
                    Challenge
                  </h3>
                  <p className="mt-1 text-small text-text-secondary">{tool.modes.challenge}</p>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <p className="eyebrow">Next build slice</p>
            <div className="mt-4 flex items-start gap-3">
              <SlidersHorizontal className="mt-1 shrink-0 text-accent" size={18} />
              <p className="text-small text-text-secondary">
                Start with controls, deterministic sample data, and one primary visualization. Add
                explanations and challenges only after the core interaction is stable.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
