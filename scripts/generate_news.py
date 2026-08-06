"""
Weekly quantum news generation pipeline.

Usage:
    python scripts/generate_news.py              # normal run
    python scripts/generate_news.py --dry-run    # fetch & score but skip OpenAI & Supabase
    python scripts/generate_news.py --force      # ignore dedup, regenerate even if this week exists
"""

from __future__ import annotations

import argparse
import os
import sys
from datetime import date
from pathlib import Path

# Allow `python scripts/generate_news.py` to resolve `scripts.*` imports the
# same way pytest (run from the repo root) does.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.generation.prompt import build_prompt
from scripts.generation.writer import generate_draft, generate_title
from scripts.processing.dedup import filter_seen
from scripts.processing.filter import select_top_items
from scripts.processing.score import score_item
from scripts.sources.arxiv import fetch_arxiv_papers
from scripts.sources.google_news import fetch_news_items
from scripts.storage.supabase_client import (
    check_existing_draft,
    init_supabase_client,
    mark_as_seen,
    save_draft,
)

GENERATION_MODEL = "gpt-4o-mini"


def _build_sources(papers: list[dict], news: list[dict]) -> list[dict]:
    paper_sources = [
        {
            "type": "arxiv",
            "id": p["arxiv_id"],
            "title": p["title"],
            "url": p["url"],
            "relevanceScore": p["score"],
        }
        for p in papers
    ]
    news_sources = [
        {
            "type": "news",
            "id": n["url"],
            "title": n["title"],
            "url": n["url"],
            "relevanceScore": n["score"],
        }
        for n in news
    ]
    return paper_sources + news_sources


def get_week_label(today: date | None = None) -> str:
    today = today or date.today()
    iso_year, iso_week, _ = today.isocalendar()
    return f"{iso_year}-W{iso_week:02d}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    week_label = get_week_label()
    supabase = None
    if not args.dry_run:
        supabase = init_supabase_client()

        existing = check_existing_draft(supabase, week_label)
        if existing and not args.force:
            print(f"本週草稿已存在（{week_label}），跳過。使用 --force 強制重新生成。")
            return 0

    papers = fetch_arxiv_papers(days_back=7)
    news = fetch_news_items()

    for paper in papers:
        paper["score"] = score_item(paper, ["title", "abstract"])
    for item in news:
        item["score"] = score_item(item, ["title", "snippet"])

    if supabase is not None:
        papers = filter_seen(papers, supabase)
        news = filter_seen(news, supabase)

    selected = select_top_items(papers, news)
    if selected is None:
        print("本週相關內容不足（papers < 3 且 news < 2），跳過生成。")
        return 0

    if args.dry_run:
        print(f"Dry run 完成。選出 {len(selected['papers'])} 篇論文、{len(selected['news'])} 則新聞。")
        return 0

    prompt, prompt_hash = build_prompt(selected["papers"], selected["news"], week_label)
    content = generate_draft(prompt, model=GENERATION_MODEL)
    title = generate_title(content, week_label, model=GENERATION_MODEL)

    assert supabase is not None
    draft_id = save_draft(
        supabase,
        {
            "week_label": week_label,
            "title": title,
            "content_md": content,
            "sources": _build_sources(selected["papers"], selected["news"]),
            "model": GENERATION_MODEL,
            "prompt_hash": prompt_hash,
        },
    )

    # Only mark items as seen once the draft has actually been saved, so a
    # failure earlier in the run doesn't burn this week's candidates.
    mark_as_seen(supabase, selected["papers"], selected["news"])

    print(f"草稿已建立（{week_label}，draft_id: {draft_id}）")

    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as f:
            f.write(f"draft_created=true\ndraft_id={draft_id}\nweek_label={week_label}\n")

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:  # noqa: BLE001 -- report a concise failure before exiting non-zero
        print(f"News automation failed: {error}", file=sys.stderr)
        sys.exit(1)
