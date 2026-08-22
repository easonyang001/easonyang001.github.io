import { Link } from "react-router-dom";
import ListPageLayout from "../../components/ListPageLayout.tsx";
import { researchAreas } from "../../data/research.ts";

function groupResearchAreas() {
  const groups = new Map<string | null, typeof researchAreas>();

  researchAreas.forEach((area) => {
    const bucket = groups.get(area.group);
    if (bucket) {
      bucket.push(area);
    } else {
      groups.set(area.group, [area]);
    }
  });

  return Array.from(groups.entries()).map(([group, areas]) => ({ group, areas }));
}

export default function ResearchPage() {
  const groupedAreas = groupResearchAreas();

  return (
    <ListPageLayout
      eyebrow="Research Directory"
      title="Research Areas"
      description="Browse the institute's research program by theme, from quantum foundations to applied intelligence."
      path="/research"
      resultCount={researchAreas.length}
      filters={
        <Link
          to="/projects"
          className="inline-block text-small font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
        >
          Applied Projects &rarr;
        </Link>
      }
    >
      <div className="space-y-10 border-t border-border pt-2">
        {groupedAreas.map(({ group, areas }) => (
          <section key={group ?? "ungrouped"} className="space-y-4">
            {group && (
              <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-text-muted/80">
                {group}
              </p>
            )}
            <ul className="divide-y divide-border border-t border-border">
              {areas.map((area) => {
                const Icon = area.icon;
                return (
                  <li key={area.slug}>
                    <Link
                      to={`/research/${area.slug}`}
                      className="flex items-center gap-4 py-6 transition-colors duration-150 hover:text-accent"
                    >
                      <Icon size={20} className="shrink-0 text-accent" />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-h3 text-text-primary">{area.title}</h2>
                          {area.status !== "active" && (
                            <span className="rounded-md border border-border px-2 py-0.5 font-mono text-mono-label uppercase text-text-muted">
                              {area.status}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-small text-text-secondary">{area.description}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </ListPageLayout>
  );
}
