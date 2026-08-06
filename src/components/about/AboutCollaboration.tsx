import { Link } from "react-router-dom";
import { site } from "../../data/site.ts";

const AUDIENCES = [
  { name: "Students", opportunities: ["Research assistantships", "Open-source contributions"] },
  { name: "Researchers", opportunities: ["Joint publications", "Research collaboration"] },
  { name: "Engineers", opportunities: ["Software development", "System implementation"] },
  { name: "Universities", opportunities: ["Joint research", "Guest talks and workshops"] },
  { name: "Industry", opportunities: ["Applied optimization", "Technical consulting"] },
];

export default function AboutCollaboration() {
  return (
    <section className="section-container border-t border-border">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <p className="section-kicker">Collaboration</p>
          <h2 className="mt-4 text-h2 text-text-primary">Who we work with</h2>
          <div className="mt-6 space-y-5">
            {AUDIENCES.map((audience) => (
              <div key={audience.name}>
                <h3 className="text-h3 text-text-primary">{audience.name}</h3>
                <p className="mt-1 text-small text-text-secondary">
                  {audience.opportunities.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="section-kicker">Join Mrama</p>
          <p className="mt-4 max-w-prose text-body-lg text-text-secondary">
            Reach out if you'd like to collaborate on research, contribute code, or discuss a project.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              to="/contact"
              className="rounded-md bg-accent px-6 py-3 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover"
            >
              Contact
            </Link>
            {site.githubUrl && (
              <a
                href={site.githubUrl}
                className="rounded-md border border-border px-6 py-3 text-small font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
