"""Standalone on-demand test tool for the full Phase 1 + Phase 2 deep-dive pipeline.

Usage:
    python scripts/generation/preview_deep_dive.py 2607.12345
    python scripts/generation/preview_deep_dive.py 2607.12345 --language fr

Chains fetch -> parse -> analyze (research/) -> write walkthrough
(generation/teacher.py) and prints the resulting Markdown. No Supabase
writes -- this is for judging whether the walkthrough actually reads well,
independent of the weekly automation's cadence and without paying for all
three languages at once. Requires OPENAI_API_KEY in the environment.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from scripts.generation.teacher import write_deep_dive
from scripts.research.paper_analyzer import analyze_paper
from scripts.research.paper_fetcher import fetch_full_text
from scripts.research.paper_parser import parse_metadata, parse_sections


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("arxiv_id")
    parser.add_argument("--language", choices=["zh-TW", "en", "fr"], default="en")
    args = parser.parse_args()

    print(f"Fetching full text for {args.arxiv_id} from ar5iv...", file=sys.stderr)
    html = fetch_full_text(args.arxiv_id)
    if html is None:
        print(f"Could not fetch full text for {args.arxiv_id} (ar5iv may not have this paper).", file=sys.stderr)
        return 1

    metadata = parse_metadata(html)
    sections = parse_sections(html)
    if not sections:
        print(
            f"ar5iv didn't return a rendered paper for {args.arxiv_id} (it may be too recent, or failed to "
            "render). Nothing usable to preview.",
            file=sys.stderr,
        )
        return 1
    print(f"Parsed sections: {', '.join(sections)}", file=sys.stderr)

    paper = {
        "arxiv_id": args.arxiv_id,
        "url": f"https://arxiv.org/abs/{args.arxiv_id}",
        "title": metadata["title"] or args.arxiv_id,
        "authors": metadata["authors"],
    }

    print("Analyzing full text...", file=sys.stderr)
    analysis = analyze_paper(paper, sections)

    print(f"Writing {args.language} walkthrough...", file=sys.stderr)
    walkthrough = write_deep_dive(analysis, paper["title"], args.language)

    print(walkthrough)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:  # noqa: BLE001 -- report a concise failure before exiting non-zero
        print(f"preview_deep_dive failed: {error}", file=sys.stderr)
        sys.exit(1)
