import HomeSection from "./HomeSection.tsx";
import { news } from "../../data/news.ts";

export default function HomeNews() {
  const featured = news.slice(0, 3);

  return (
    <HomeSection
      eyebrow="News"
      title="News"
      viewAllHref="/news"
      viewAllLabel={`All ${news.length} updates`}
    >
      <div className="border-l border-border">
        {featured.map((item) => (
          <div key={item.slug} className="border-b border-border py-6 pl-8 last:border-b-0">
            <time className="font-mono text-mono-label uppercase text-text-muted">
              {new Date(item.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <h3 className="mt-1 text-h3 text-text-primary">{item.title}</h3>
            <p className="mt-2 text-small text-text-secondary">{item.description}</p>
          </div>
        ))}
      </div>
    </HomeSection>
  );
}
