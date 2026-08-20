import HomeSection from "./HomeSection.tsx";
import { publications } from "../../data/publications.ts";

export default function HomePublications() {
  const featured = publications.slice(0, 3);

  return (
    <HomeSection
      title="Publications"
      viewAllHref="/publications"
      viewAllLabel={`All ${publications.length} publications`}
    >
      <div className="border-l border-border">
        {featured.map((pub) => (
          <div key={pub.slug} className="border-b border-border py-6 pl-8 last:border-b-0">
            <div className="flex flex-wrap items-center gap-3 text-small font-medium text-white/76">
              <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-white/78">
                {pub.year}
              </span>
              <span className="text-white/28">&middot;</span>
              <span className="text-white/72">{pub.venue}</span>
            </div>
            <h3 className="mt-3 text-h3 text-text-primary">{pub.title}</h3>
          </div>
        ))}
      </div>
    </HomeSection>
  );
}
