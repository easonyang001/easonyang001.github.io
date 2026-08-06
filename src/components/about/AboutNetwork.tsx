import { Link } from "react-router-dom";
import { people } from "../../data/people.ts";
import { site } from "../../data/site.ts";
import WorldMap from "./WorldMap.tsx";

const TIMELINE = [
  { year: "2026", label: "Founded", description: `Mrama Institute established, based in ${site.location}.` },
  { year: "2026", label: "Website Launched", description: "Public site introducing the research program." },
  { year: "Ongoing", label: "Active Research", description: "Quantum optimization, annealing, and hybrid solvers." },
];

export default function AboutNetwork() {
  return (
    <section className="section-container border-t border-border">
      <p className="text-small font-medium text-text-muted">Research Network</p>
      <h2 className="mt-4 text-h2 text-text-primary">Who's involved</h2>
      <p className="mt-4 max-w-prose text-body-lg text-text-secondary">
        Mrama is small by design today — this map and list grow as people join.
      </p>

      <div className="glass-card mt-10 overflow-hidden p-2">
        <WorldMap people={people} />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="flex flex-wrap content-start gap-4">
          {people.map((person) => (
            <Link
              key={person.slug}
              to={`/people/${person.slug}`}
              className="glass-card flex items-center gap-3 py-3 pl-3 pr-5"
            >
              {person.avatarUrl ? (
                <img src={person.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-subtle text-small text-accent">
                  {person.avatarInitials}
                </div>
              )}
              <div>
                <p className="text-small font-medium text-text-primary">{person.name}</p>
                <p className="font-mono text-mono-label uppercase text-text-muted">
                  {person.roles.join(", ")}
                  {person.locationCountry ? ` · ${person.locationCountry}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div>
          <p className="text-small font-medium text-text-muted">Timeline</p>
          <div className="relative mt-6 border-l border-border pl-8">
            {TIMELINE.map((item) => (
              <div key={item.label} className="relative mb-8 last:mb-0">
                <span className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-accent" />
                <p className="font-mono text-mono-label uppercase text-accent">{item.year}</p>
                <h3 className="mt-1 text-h3 text-text-primary">{item.label}</h3>
                <p className="mt-1 text-small text-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
