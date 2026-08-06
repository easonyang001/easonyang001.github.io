import { marked } from "marked";
import { sanitizeRichText } from "./sanitize.js";

const FORMAT = "mrama-weekly-brief-v1" as const;
const LANGUAGES = ["zh-TW", "en", "fr"] as const;
const SECTIONS = ["weeklyNews", "selectedPapers", "literatureDeepDive"] as const;

type Language = (typeof LANGUAGES)[number];
type Section = (typeof SECTIONS)[number];

interface Translation {
  title: string;
  summary: string;
  sections: Record<Section, string>;
}

export interface WeeklyBrief {
  format: typeof FORMAT;
  contentType: "markdown" | "html";
  translations: Record<Language, Translation>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isTextWithin(value: unknown, maxLength: number): value is string {
  return isText(value) && value.length <= maxLength;
}

export function parseWeeklyBrief(raw: string): WeeklyBrief | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    if (raw.trimStart().startsWith("{")) throw new Error("Weekly brief contains invalid JSON");
    return null;
  }
  if (!isRecord(value) || value.format !== FORMAT) return null;
  if (value.contentType !== "markdown" && value.contentType !== "html") {
    throw new Error("Weekly brief has an invalid contentType");
  }
  if (!isRecord(value.translations)) throw new Error("Weekly brief translations are missing");

  for (const language of LANGUAGES) {
    const translation = value.translations[language];
    if (!isRecord(translation) || !isTextWithin(translation.title, 200) || !isTextWithin(translation.summary, 500)) {
      throw new Error(`Weekly brief ${language} title or summary is missing`);
    }
    if (!isRecord(translation.sections)) throw new Error(`Weekly brief ${language} sections are missing`);
    for (const section of SECTIONS) {
      if (!isText(translation.sections[section])) {
        throw new Error(`Weekly brief ${language}.${section} is missing`);
      }
    }
  }
  return value as unknown as WeeklyBrief;
}

export async function renderWeeklyBrief(brief: WeeklyBrief): Promise<WeeklyBrief> {
  if (brief.contentType !== "markdown") return brief;

  const translations = {} as Record<Language, Translation>;
  for (const language of LANGUAGES) {
    const source = brief.translations[language];
    const sections = {} as Record<Section, string>;
    for (const section of SECTIONS) {
      sections[section] = sanitizeRichText(await marked.parse(source.sections[section]));
    }
    translations[language] = { title: source.title.trim(), summary: source.summary.trim(), sections };
  }

  return { format: FORMAT, contentType: "html", translations };
}
