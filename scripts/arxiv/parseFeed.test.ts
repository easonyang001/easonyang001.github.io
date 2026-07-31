import { describe, it, expect } from "vitest";
import { parseAtomFeed } from "./parseFeed.ts";

const TWO_ENTRY_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2507.12345v1</id>
    <updated>2026-07-25T12:00:00Z</updated>
    <published>2026-07-24T18:00:00Z</published>
    <title>A QUBO Formulation for Facility Placement</title>
    <summary>We study a QUBO formulation of the facility placement problem.</summary>
    <author><name>Jane Doe</name></author>
    <author><name>John Smith</name></author>
    <category term="quant-ph" scheme="http://arxiv.org/schemas/atom"/>
    <category term="math.OC" scheme="http://arxiv.org/schemas/atom"/>
  </entry>
  <entry>
    <id>http://arxiv.org/abs/2507.54321v2</id>
    <updated>2026-07-23T09:00:00Z</updated>
    <published>2026-07-22T08:00:00Z</published>
    <title>Barren Plateaus in Deep Ansätze</title>
    <summary>We analyze gradient variance in deep parameterized circuits.</summary>
    <author><name>Alice Chen</name></author>
    <category term="quant-ph" scheme="http://arxiv.org/schemas/atom"/>
  </entry>
</feed>`;

const SINGLE_ENTRY_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2507.99999v1</id>
    <updated>2026-07-20T00:00:00Z</updated>
    <published>2026-07-19T00:00:00Z</published>
    <title>Solo Entry Title</title>
    <summary>Solo abstract.</summary>
    <author><name>Only Author</name></author>
    <category term="cs.LG" scheme="http://arxiv.org/schemas/atom"/>
  </entry>
</feed>`;

const EMPTY_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
</feed>`;

describe("parseAtomFeed", () => {
  it("parses multiple entries with all fields", () => {
    const papers = parseAtomFeed(TWO_ENTRY_FEED);
    expect(papers).toHaveLength(2);

    expect(papers[0].arxivId).toBe("2507.12345");
    expect(papers[0].title).toBe("A QUBO Formulation for Facility Placement");
    expect(papers[0].authors).toEqual(["Jane Doe", "John Smith"]);
    expect(papers[0].categories).toEqual(["quant-ph", "math.OC"]);
    expect(papers[0].submittedDate).toBe("2026-07-24");
    expect(papers[0].arxivUrl).toBe("http://arxiv.org/abs/2507.12345v1");
    expect(papers[0].abstract).toContain("QUBO formulation");
  });

  it("normalizes a single entry to an array (fast-xml-parser quirk)", () => {
    const papers = parseAtomFeed(SINGLE_ENTRY_FEED);
    expect(papers).toHaveLength(1);
    expect(papers[0].arxivId).toBe("2507.99999");
    expect(papers[0].authors).toEqual(["Only Author"]);
  });

  it("returns an empty array for a feed with no entries", () => {
    expect(parseAtomFeed(EMPTY_FEED)).toEqual([]);
  });
});
