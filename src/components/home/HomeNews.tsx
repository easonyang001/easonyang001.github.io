import HomeSection from "./HomeSection.tsx";
import { news } from "../../data/news.ts";
import { sanitizeRichText } from "../../lib/sanitize.ts";

export default function HomeNews() {
  const featured = [...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <HomeSection
      title="News"
      viewAllHref="/news"
      viewAllLabel={`All ${news.length} updates`}
    >
      <div className="border-l border-border">
        {featured.map((item) => (
          <div key={item.slug} className="border-b border-border py-6 pl-8 last:border-b-0">
            <div className="flex flex-wrap items-center gap-3 text-small font-medium text-white/76">
              <time className="text-white/80">
                {new Date(item.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="text-white/28">&middot;</span>
              <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-white/72">
                {item.category}
              </span>
            </div>
            <h3 className="mt-1 text-h3 text-text-primary">{item.title}</h3>
            <div
              className="mt-2 text-small text-text-secondary [&_a]:text-accent [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.summary) }}
            />
          </div>
        ))}
      </div>
    </HomeSection>
  );
}
