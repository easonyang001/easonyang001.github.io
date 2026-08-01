import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ADMIN_ENTITIES } from "./dataFiles.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");

describe("ADMIN_ENTITIES parse/serialize", () => {
  for (const entity of ADMIN_ENTITIES) {
    it(`parses the real ${entity.filePath} and round-trips through serialize`, () => {
      const source = readFileSync(join(REPO_ROOT, entity.filePath), "utf-8");
      const items = entity.parse(source);

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(typeof item.slug).toBe("string");
        expect((item.slug as string).length).toBeGreaterThan(0);
      }

      const serialized = entity.serialize(items);
      const reparsed = entity.parse(serialized);
      expect(reparsed).toEqual(items);
    });
  }

  it("produces a fresh empty item with an empty (falsy) slug for every entity", () => {
    for (const entity of ADMIN_ENTITIES) {
      const empty = entity.emptyItem();
      expect(empty.slug).toBe("");
    }
  });

  it("escapes quotes and newlines so the generated file stays syntactically valid", () => {
    const news = ADMIN_ENTITIES.find((e) => e.key === "news")!;
    const items = [
      { slug: "test", date: "2026-01-01", title: 'A "quoted" title', description: "Line one\nLine two" },
    ];
    const serialized = news.serialize(items);
    const reparsed = news.parse(serialized);
    expect(reparsed[0].title).toBe('A "quoted" title');
    expect(reparsed[0].description).toBe("Line one\nLine two");
  });
});
