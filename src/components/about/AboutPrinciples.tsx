import { Link } from "react-router-dom";
import { researchAreas } from "../../data/research.ts";

const WHY_MRAMA = [
  { title: "Independent", description: "Not bound to a single university department or funding cycle." },
  { title: "Practical", description: "Research is judged by whether it solves a real problem." },
  { title: "Engineering-driven", description: "Ideas are built and tested, not left as theory alone." },
  { title: "Open", description: "Methods and code are published so results can be checked and reused." },
];

const CORE_VALUES = [
  "Scientific Integrity",
  "Curiosity",
  "Engineering Excellence",
  "Open Collaboration",
  "Reproducible Research",
];

export default function AboutPrinciples() {
  return (
    <section className="section-container border-t border-border">
      <p className="text-small font-medium text-text-muted">Research Areas</p>
      <h2 className="mt-4 text-h2 text-text-primary">What we work on</h2>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {researchAreas.map((area) => {
          const Icon = area.icon;
          return (
            <Link key={area.slug} to={`/research/${area.slug}`} className="glass-card p-6">
              <Icon size={20} className="text-accent" />
              <h3 className="mt-4 text-h3 text-text-primary">{area.title}</h3>
              <p className="mt-2 text-small text-text-secondary">{area.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-16 grid grid-cols-1 gap-12 border-t border-border pt-12 lg:grid-cols-2">
        <div>
          <p className="text-small font-medium text-text-muted">Why Mrama</p>
          <div className="mt-6 space-y-6">
            {WHY_MRAMA.map((item) => (
              <div key={item.title}>
                <h3 className="text-h3 text-text-primary">{item.title}</h3>
                <p className="mt-1 text-small text-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-small font-medium text-text-muted">Core Values</p>
          <ul className="mt-6 space-y-3">
            {CORE_VALUES.map((value) => (
              <li key={value} className="flex gap-3 text-body text-text-secondary">
                <span className="text-accent">—</span>
                {value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
