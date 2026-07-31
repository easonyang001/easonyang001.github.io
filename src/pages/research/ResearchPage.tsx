import { Link } from "react-router-dom";
import ListPageLayout from "../../components/ListPageLayout.tsx";
import { researchAreas } from "../../data/research.ts";

export default function ResearchPage() {
  return (
    <ListPageLayout
      eyebrow="Research"
      title="Research Areas"
      description="Core disciplines that define our research program, from foundational quantum information theory to applied intelligent optimization."
      resultCount={researchAreas.length}
    >
      <ul className="divide-y divide-border border-t border-border">
        {researchAreas.map((area) => {
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
    </ListPageLayout>
  );
}
