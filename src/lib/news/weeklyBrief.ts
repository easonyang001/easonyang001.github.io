export const WEEKLY_BRIEF_FORMAT = "mrama-weekly-brief-v1" as const;

export const WEEKLY_BRIEF_LANGUAGES = ["zh-TW", "en", "fr"] as const;
export type WeeklyBriefLanguage = (typeof WEEKLY_BRIEF_LANGUAGES)[number];

export const WEEKLY_BRIEF_SECTION_KEYS = ["weeklyNews", "selectedPapers", "literatureDeepDive"] as const;
export type WeeklyBriefSectionKey = (typeof WEEKLY_BRIEF_SECTION_KEYS)[number];

export interface WeeklyBriefTranslation {
  title: string;
  summary: string;
  sections: Record<WeeklyBriefSectionKey, string>;
}

export interface WeeklyBriefDocument {
  format: typeof WEEKLY_BRIEF_FORMAT;
  contentType: "markdown" | "html";
  translations: Record<WeeklyBriefLanguage, WeeklyBriefTranslation>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseWeeklyBrief(raw: string | null | undefined): WeeklyBriefDocument | null {
  if (!raw) return null;

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(value) || value.format !== WEEKLY_BRIEF_FORMAT) return null;
  if (value.contentType !== "markdown" && value.contentType !== "html") return null;
  if (!isRecord(value.translations)) return null;

  for (const language of WEEKLY_BRIEF_LANGUAGES) {
    const translation = value.translations[language];
    if (!isRecord(translation) || !isNonEmptyString(translation.title) || !isNonEmptyString(translation.summary)) {
      return null;
    }
    if (!isRecord(translation.sections)) return null;
    for (const section of WEEKLY_BRIEF_SECTION_KEYS) {
      if (!isNonEmptyString(translation.sections[section])) return null;
    }
  }

  return value as unknown as WeeklyBriefDocument;
}

export function serializeWeeklyBrief(brief: WeeklyBriefDocument): string {
  return JSON.stringify(brief, null, 2);
}
