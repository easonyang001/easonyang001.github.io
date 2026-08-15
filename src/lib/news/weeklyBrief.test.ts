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

  it("parses a brief with no conceptOfTheWeek (backward compat with already-published articles)", () => {
    const brief = makeBrief();
    expect(parseWeeklyBrief(JSON.stringify(brief))?.translations.en.conceptOfTheWeek).toBeUndefined();
  });

  it("parses a brief with a valid conceptOfTheWeek", () => {
    const brief = makeBrief();
    brief.translations.en.conceptOfTheWeek = "## In One Sentence\nA concept.";
    expect(parseWeeklyBrief(JSON.stringify(brief))?.translations.en.conceptOfTheWeek).toBe(
      "## In One Sentence\nA concept."
    );
  });

  it("rejects a present-but-empty conceptOfTheWeek", () => {
    const brief = makeBrief();
    brief.translations.en.conceptOfTheWeek = "";
    expect(parseWeeklyBrief(JSON.stringify(brief))).toBeNull();
  });
});
