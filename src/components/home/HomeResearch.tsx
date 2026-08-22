import { Link } from "react-router-dom";
import HomeSection from "./HomeSection.tsx";
import { researchAreas } from "../../data/research.ts";

export default function HomeResearch() {
  const featured = researchAreas.slice(0, 3);

  return (
    <HomeSection
      title="Research Areas"
      description="Core disciplines that define our research program."
      viewAllHref="/research"
      viewAllLabel="View all research"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {featured.map((area) => {
          const Icon = area.icon;
          return (
            <Link key={area.slug} to={`/research/${area.slug}`} className="glass-card p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-subtle text-accent">
                <Icon size={20} />
              </div>
              <h3 className="mt-5 text-h3 text-text-primary">{area.title}</h3>
              <p className="mt-2 text-small text-text-secondary">{area.description}</p>
            </Link>
          );
        })}
      </div>
    </HomeSection>
  );
}
