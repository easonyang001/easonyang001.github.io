// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { sanitizeRichText } from "./sanitize.ts";

describe("sanitizeRichText", () => {
  it("keeps allowed formatting tags", () => {
    const html = "<p>Hello <strong>world</strong>, <em>foo</em></p>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("keeps links with href/target/rel", () => {
    const html = '<p><a href="https://example.com" target="_blank" rel="noopener">link</a></p>';
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("keeps lists", () => {
    const html = "<ul><li>one</li><li>two</li></ul>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("strips script tags entirely", () => {
    const html = '<p>hi</p><script>alert("xss")</script>';
    expect(sanitizeRichText(html)).toBe("<p>hi</p>");
  });

  it("strips disallowed tags but keeps their text content", () => {
    const html = "<h1>Heading</h1><p>body</p>";
    expect(sanitizeRichText(html)).toBe("Heading<p>body</p>");
  });

  it("strips event handler attributes", () => {
    const html = '<p onclick="alert(1)">click me</p>';
    expect(sanitizeRichText(html)).toBe("<p>click me</p>");
  });

  it("strips javascript: URLs", () => {
    const html = '<p><a href="javascript:alert(1)">bad link</a></p>';
    expect(sanitizeRichText(html)).toBe("<p><a>bad link</a></p>");
  });
});
