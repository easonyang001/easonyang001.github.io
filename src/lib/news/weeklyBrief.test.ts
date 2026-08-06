import { describe, expect, it } from "vitest";
import { parseWeeklyBrief, serializeWeeklyBrief, WEEKLY_BRIEF_FORMAT, type WeeklyBriefDocument } from "./weeklyBrief.ts";

function makeBrief(): WeeklyBriefDocument {
  const translation = (title: string) => ({
    title,
    summary: "Summary",
    sections: { weeklyNews: "News", selectedPapers: "Papers", literatureDeepDive: "Deep dive" },
  });
  return {
    format: WEEKLY_BRIEF_FORMAT,
    contentType: "html",
    translations: { "zh-TW": translation("中文"), en: translation("English"), fr: translation("Francais") },
  };
}

describe("parseWeeklyBrief", () => {
  it("parses a complete brief", () => {
    expect(parseWeeklyBrief(serializeWeeklyBrief(makeBrief()))?.translations.en.title).toBe("English");
  });

  it("returns null for legacy HTML", () => {
    expect(parseWeeklyBrief("<p>Legacy article</p>")).toBeNull();
  });

  it("rejects an incomplete translation", () => {
    const brief = makeBrief();
    brief.translations.fr.sections.selectedPapers = "";
    expect(parseWeeklyBrief(JSON.stringify(brief))).toBeNull();
  });
});
