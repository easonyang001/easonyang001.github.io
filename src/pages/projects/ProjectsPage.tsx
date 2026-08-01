import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ListPageLayout from "../../components/ListPageLayout.tsx";
import { Segmented, SegmentedButton } from "../../components/Segmented.tsx";
import { projects } from "../../data/projects.ts";

export default function ProjectsPage() {
  const statuses = useMemo(() => ["All", ...new Set(projects.map((p) => p.status))], []);
  const [status, setStatus] = useState("All");

  const filtered = useMemo(
    () => (status === "All" ? projects : projects.filter((p) => p.status === status)),
    [status]
  );

  return (
    <ListPageLayout
      title="Projects"
      description="Applied research initiatives translating quantum and optimization theory into working systems."
      resultCount={filtered.length}
      filters={
        <div>
          <p className="mb-2 font-mono text-mono-label uppercase text-text-muted">Status</p>
          <Segmented>
            {statuses.map((s) => (
              <SegmentedButton key={s} active={status === s} onClick={() => setStatus(s)}>
                {s}
              </SegmentedButton>
            ))}
          </Segmented>
        </div>
      }
    >
      <ul className="divide-y divide-border border-t border-border">
        {filtered.map((project) => (
          <li key={project.slug}>
            <Link
              to={`/projects/${project.slug}`}
              className="flex items-center justify-between gap-4 py-6 transition-colors duration-150 hover:text-accent"
            >
              <div>
                <h2 className="text-h3 text-text-primary">{project.title}</h2>
                <p className="mt-1 text-small text-text-secondary">{project.description}</p>
              </div>
              <span className="shrink-0 rounded-md bg-accent-subtle px-2 py-1 font-mono text-mono-label uppercase text-accent">
                {project.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </ListPageLayout>
  );
}
