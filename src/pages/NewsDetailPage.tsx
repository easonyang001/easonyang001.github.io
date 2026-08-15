import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Segmented, SegmentedButton } from "../components/Segmented.tsx";
import { news } from "../data/news.ts";
import { sanitizeRichText } from "../lib/sanitize.ts";
import { useSeo } from "../lib/seo/useSeo.ts";
import {
  parseWeeklyBrief,
  type WeeklyBriefDocument,
  type WeeklyBriefLanguage,
  type WeeklyBriefSectionKey,
} from "../lib/news/weeklyBrief.ts";
import type { NewsItem } from "../types/index.ts";
import NotFoundPage from "./NotFoundPage.tsx";

const LANGUAGE_OPTIONS: Array<{ key: WeeklyBriefLanguage; label: string }> = [
  { key: "zh-TW", label: "中文" },
  { key: "en", label: "English" },
  { key: "fr", label: "Français" },
];

const SECTION_LABELS: Record<WeeklyBriefLanguage, Record<WeeklyBriefSectionKey, string>> = {
  "zh-TW": { weeklyNews: "本週新聞", selectedPapers: "精選論文", literatureDeepDive: "論文文獻精讀" },
  en: { weeklyNews: "Weekly News", selectedPapers: "Selected Papers", literatureDeepDive: "Literature Deep Dive" },
  fr: {
    weeklyNews: "Actualités de la semaine",
    selectedPapers: "Articles sélectionnés",
    literatureDeepDive: "Analyse approfondie",
  },
};

const SECTION_KEYS: WeeklyBriefSectionKey[] = ["weeklyNews", "selectedPapers", "literatureDeepDive"];

// Not part of WeeklyBriefSectionKey/SECTION_KEYS: conceptOfTheWeek is
// optional (added after brief-format articles were already published, see
// docs/architecture/news-automation.md Phase 4), so it's rendered as its
// own conditional block below rather than folded into the SECTION_KEYS map,
// which assumes every key is always present.
const CONCEPT_OF_THE_WEEK_LABEL: Record<WeeklyBriefLanguage, string> = {
  "zh-TW": "本週概念",
  en: "Concept of the Week",
  fr: "Concept de la semaine",
};
const RICH_TEXT_CLASS =
  "mt-5 max-w-3xl text-body leading-relaxed text-text-secondary [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_h3]:mt-7 [&_h3]:text-h4 [&_h3]:text-text-primary [&_h4]:mt-6 [&_h4]:font-semibold [&_h4]:text-text-primary [&_li+li]:mt-2 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p+p]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6";

function Article({ item, brief }: { item: NewsItem; brief: WeeklyBriefDocument | null }) {
  const [language, setLanguage] = useState<WeeklyBriefLanguage>("zh-TW");
  const translation = brief?.translations[language];
  const title = translation?.title ?? item.title;
  const summary = translation?.summary ?? item.summary;

  useSeo({ title, description: summary, path: `/news/${item.slug}` });

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-12 sm:px-8 lg:px-12 lg:pt-16">
      <Link
        to="/news"
        aria-label="Back to news"
        className="inline-flex items-center gap-2 text-small font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        News
      </Link>

      <header className="mt-10 max-w-4xl border-b border-border pb-10">
        <div className="flex flex-wrap items-center gap-3 font-mono text-mono-label uppercase text-text-muted">
          <time dateTime={item.date}>
            {new Date(item.date).toLocaleDateString(language === "zh-TW" ? "zh-TW" : language, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span aria-hidden="true">&middot;</span>
          <span className="text-accent">{item.category}</span>
        </div>
        <h1 className="mt-4 max-w-4xl text-h1 text-text-primary">{title}</h1>
        <p className="mt-5 max-w-3xl text-body-lg text-text-secondary">{summary}</p>
        {brief && (
          <div className="mt-8 w-full max-w-sm" aria-label="Article language">
            <Segmented>
              {LANGUAGE_OPTIONS.map((option) => (
                <SegmentedButton
                  key={option.key}
                  active={language === option.key}
                  onClick={() => setLanguage(option.key)}
                >
                  {option.label}
                </SegmentedButton>
              ))}
            </Segmented>
          </div>
        )}
      </header>

      {brief && translation ? (
        <article className="max-w-4xl" lang={language}>
          {SECTION_KEYS.map((section) => (
            <section key={section} className="border-b border-border py-10 last:border-b-0">
              <h2 className="text-h2 text-text-primary">{SECTION_LABELS[language][section]}</h2>
              <div
                className={RICH_TEXT_CLASS}
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(translation.sections[section]) }}
              />
            </section>
          ))}
          {translation.conceptOfTheWeek && (
            <section className="border-b border-border py-10 last:border-b-0">
              <h2 className="text-h2 text-text-primary">{CONCEPT_OF_THE_WEEK_LABEL[language]}</h2>
              <div
                className={RICH_TEXT_CLASS}
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(translation.conceptOfTheWeek) }}
              />
            </section>
          )}
        </article>
      ) : (
        item.content && (
          <article
            className={`${RICH_TEXT_CLASS} py-10`}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(item.content) }}
          />
        )
      )}
    </div>
  );
}

export default function NewsDetailPage() {
  const { slug } = useParams();
  const item = news.find((candidate) => candidate.slug === slug);
  if (!item || !item.content) return <NotFoundPage />;
  return <Article item={item} brief={parseWeeklyBrief(item.content)} />;
}
