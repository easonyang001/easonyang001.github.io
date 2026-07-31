import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell.tsx";
import { labTools } from "../../data/labTools.ts";

export default function LabPage() {
  return (
    <PageShell
      eyebrow="Lab"
      title="Interactive Lab"
      description="Hands-on tools for exploring quantum states, circuits, and optimization landscapes."
    >
      <ul className="divide-y divide-border border-t border-border">
        {labTools.map((tool) => (
          <li key={tool.slug}>
            <Link
              to={`/lab/${tool.slug}`}
              className="flex items-center justify-between gap-4 py-6 transition-colors duration-150 hover:text-accent"
            >
              <div>
                <h2 className="text-h3 text-text-primary">{tool.name}</h2>
                <p className="mt-1 text-small text-text-secondary">{tool.description}</p>
              </div>
              <span className="shrink-0 rounded-md border border-border px-2 py-1 font-mono text-mono-label uppercase text-text-secondary">
                {tool.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
