import HomeSection from "./HomeSection.tsx";
import { publications } from "../../data/publications.ts";

export default function HomePublications() {
  const featured = publications.slice(0, 3);

  return (
    <HomeSection
      eyebrow="Publications"
      title="Publications"
      viewAllHref="/publications"
      viewAllLabel={`All ${publications.length} publications`}
    >
      <div className="border-l border-border">
        {featured.map((pub) => (
          <div key={pub.slug} className="border-b border-border py-6 pl-8 last:border-b-0">
            <div className="flex flex-wrap items-center gap-3 font-mono text-mono-label uppercase text-text-muted">
              <span className="text-accent">{pub.year}</span>
              <span>&middot;</span>
              <span>{pub.conference}</span>
            </div>
            <h3 className="mt-3 text-h3 text-text-primary">{pub.title}</h3>
          </div>
        ))}
      </div>
    </HomeSection>
  );
}
