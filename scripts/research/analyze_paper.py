"""Standalone on-demand test tool for the paper analysis pipeline.

Usage:
    python scripts/research/analyze_paper.py 2607.12345

Fetches the paper's full text, parses it into sections, runs the analyzer,
and prints the resulting Paper Intelligence JSON to stdout. Does not touch
Supabase -- this is purely for inspecting analysis quality on any paper,
independent of the weekly automation's cadence and dedup rules. Requires
OPENAI_API_KEY in the environment (same as the weekly pipeline).
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from scripts.research.paper_analyzer import analyze_paper
from scripts.research.paper_fetcher import fetch_full_text
from scripts.research.paper_parser import parse_metadata, parse_sections
from scripts.research.schemas import assemble_paper_intelligence, serialize_paper_intelligence


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python scripts/research/analyze_paper.py <arxiv_id>", file=sys.stderr)
        return 1

    arxiv_id = sys.argv[1]
    print(f"Fetching full text for {arxiv_id} from ar5iv...", file=sys.stderr)
    html = fetch_full_text(arxiv_id)
    if html is None:
        print(f"Could not fetch full text for {arxiv_id} (ar5iv may not have this paper).", file=sys.stderr)
        return 1

    metadata = parse_metadata(html)
    sections = parse_sections(html)
    if not sections:
        print(
            f"ar5iv didn't return a rendered paper for {arxiv_id} (it may be too recent, or failed to "
            "render). Nothing usable to analyze -- not spending an API call on it.",
            file=sys.stderr,
        )
        return 1
    print(f"Parsed sections: {', '.join(sections)}", file=sys.stderr)

    paper = {
        "arxiv_id": arxiv_id,
        "url": f"https://arxiv.org/abs/{arxiv_id}",
        "title": metadata["title"] or arxiv_id,
        "authors": metadata["authors"],
    }

    print("Analyzing...", file=sys.stderr)
    analysis = analyze_paper(paper, sections)
    print(serialize_paper_intelligence(assemble_paper_intelligence(analysis)))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:  # noqa: BLE001 -- report a concise failure before exiting non-zero
        print(f"analyze_paper failed: {error}", file=sys.stderr)
        sys.exit(1)
