import { Link } from "react-router-dom";
import HomeSection from "./HomeSection.tsx";
import { labTools } from "../../data/labTools.ts";

export default function HomeLab() {
  const featured = labTools.slice(0, 2);

  return (
    <HomeSection
      eyebrow="Lab"
      title="Interactive Lab"
      description="Hands-on tools for exploring quantum states, circuits, and optimization landscapes."
      viewAllHref="/lab"
      viewAllLabel={`All ${labTools.length} tools`}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {featured.map((tool) => (
          <Link key={tool.slug} to={`/lab/${tool.slug}`} className="glass-card p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-h3 text-text-primary">{tool.name}</h3>
              <span className="shrink-0 rounded-md border border-border px-2 py-1 font-mono text-mono-label uppercase text-text-secondary">
                {tool.status}
              </span>
            </div>
            <p className="mt-2 text-small text-text-secondary">{tool.description}</p>
          </Link>
        ))}
      </div>
    </HomeSection>
  );
}
