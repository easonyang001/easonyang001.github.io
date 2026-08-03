import { site } from "../../data/site.ts";
import { researchAreas } from "../../data/research.ts";

const STATS = [
  { label: "Founded", value: String(site.foundedYear) },
  { label: "Research Areas", value: String(researchAreas.length) },
  { label: "Location", value: site.location },
  { label: "Status", value: "Independent & Self-Funded" },
];

export default function AboutGlance() {
  return (
    <section className="section-container border-t border-border !py-12">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="font-mono text-mono-label uppercase text-text-muted">{stat.label}</p>
            <p className="mt-2 text-h4 text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
