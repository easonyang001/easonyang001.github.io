import { describe, expect, it } from "vitest";
import { nextAvailableSlug, slugify } from "./slugs.ts";

describe("slugify", () => {
  it("normalizes names into route-safe slugs", () => {
    expect(slugify("  Chia_Chen  Yang! ")).toBe("chia-chen-yang");
  });

  it("removes repeated and edge hyphens", () => {
    expect(slugify("--New---Person--")).toBe("new-person");
  });
});

describe("nextAvailableSlug", () => {
  it("keeps an unused slug", () => {
    expect(nextAvailableSlug("New Person", ["existing-person"])).toBe("new-person");
  });

  it("uses the first available numeric suffix", () => {
    expect(nextAvailableSlug("New Person", ["new-person", "new-person-2", "new-person-4"])).toBe(
      "new-person-3"
    );
  });

  it("does not invent a slug for a name without supported characters", () => {
    expect(nextAvailableSlug("新成員", ["person"])).toBe("");
  });
});
