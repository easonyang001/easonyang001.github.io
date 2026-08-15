"""
Weekly quantum news generation pipeline.

Usage:
    python scripts/generate_news.py              # normal run
    python scripts/generate_news.py --dry-run    # fetch & score but skip OpenAI & Supabase
    python scripts/generate_news.py --force      # add another draft even if this week already has one
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

from scripts.generation.prompt import build_prompts
from scripts.generation.brief import LANGUAGES, assemble_brief, parse_generated_translation, serialize_brief
from scripts.generation.writer import generate_draft
from scripts.processing.dedup import filter_seen
from scripts.processing.filter import select_top_items
from scripts.processing.score import score_item
from scripts.generation.concept import write_concept_of_the_week
from scripts.generation.critic import review_translation
from scripts.generation.teacher import write_deep_dive
from scripts.generation.translator import translate_brief_translation, translate_markdown
from scripts.research.paper_analyzer import ANALYSIS_MODEL, analyze_paper, compute_analysis_prompt_hash
from scripts.research.paper_fetcher import fetch_full_text
from scripts.research.paper_parser import parse_sections
from scripts.sources.arxiv import fetch_arxiv_papers
from scripts.sources.google_news import fetch_news_items
from scripts.storage.supabase_client import (
    check_existing_draft,
    get_cached_paper_intelligence,
    init_supabase_client,
    mark_as_seen,
    save_draft,
    save_paper_intelligence,
)

GENERATION_MODEL = "gpt-4o-mini"
MAX_BRIEF_ATTEMPTS = 3
# Generate once in this language, then translate -- see
# scripts/generation/translator.py for why (independent per-language
# generation let selection/wording diverge across languages).
CANONICAL_LANGUAGE = "en"


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


def _generate_valid_translation(language: str, prompt: str) -> dict:
    """Generate one language's translation and retry if it fails validation.

    An empty section or truncated JSON is stochastic content quality, not a
    network failure, so generate_draft's own timeout-retry loop doesn't
    cover it -- this is a separate retry layer on top, scoped to a single
    language so one bad language doesn't force redoing the other two.
    """
    last_error: ValueError | None = None
    for attempt in range(1, MAX_BRIEF_ATTEMPTS + 1):
        try:
            generated = generate_draft(prompt, model=GENERATION_MODEL)
            return parse_generated_translation(language, generated)
        except ValueError as error:
            last_error = error
            print(f"{language} 翻譯未通過驗證（第 {attempt} 次嘗試）：{error}")
    assert last_error is not None
    raise last_error


def _generate_valid_brief(prompts: dict[str, str]) -> dict:
    """Generate the canonical translation once, then translate it into the
    other languages -- generating each language fully independently used to
    let selection/wording diverge across languages (see
    scripts/generation/translator.py). A translation failure here is NOT
    caught: weeklyNews/selectedPapers/literatureDeepDive are required fields
    (brief.py::SECTION_KEYS), so a missing language would produce a draft
    the frontend rejects outright, not a usable partial one -- this is the
    same "exhausted retries fails the run" contract the canonical
    generation already had.
    """
    canonical = _generate_valid_translation(CANONICAL_LANGUAGE, prompts[CANONICAL_LANGUAGE])
    translations = {CANONICAL_LANGUAGE: canonical}
    for language in LANGUAGES:
        if language == CANONICAL_LANGUAGE:
            continue
        translations[language] = translate_brief_translation(canonical, language)
    return assemble_brief(translations)


def _get_deep_dive_analysis(supabase, paper: dict) -> dict | None:
    """Best-effort full-text analysis for this week's deep-dive candidate.

    Never raises -- any failure (fetch, parse, or analysis) means
    literatureDeepDive falls back to today's abstract-only behavior for this
    paper, the same as if there were no candidate at all. Results are cached
    by (arxiv_id, prompt_hash) so a candidate that repeats across weeks
    (unlikely given dedup, but possible with --force) isn't re-analyzed.
    """
    try:
        html = fetch_full_text(paper["arxiv_id"])
        if html is None:
            return None
        sections = parse_sections(html)
        if not sections:
            return None

        prompt_hash = compute_analysis_prompt_hash(paper, sections)
        cached = get_cached_paper_intelligence(supabase, paper["arxiv_id"], prompt_hash)
        if cached is not None:
            return cached

        analysis = analyze_paper(paper, sections)
        save_paper_intelligence(supabase, paper["arxiv_id"], prompt_hash, analysis, ANALYSIS_MODEL)
        return analysis
    except Exception as error:  # noqa: BLE001 -- deep-dive enrichment is optional, never fail the run
        print(f"Deep-dive 全文分析失敗（{paper.get('arxiv_id')}），退回摘要模式：{error}")
        return None


def _write_deep_dive_walkthroughs(brief: dict, deep_dive: dict, deep_dive_title: str) -> None:
    """Write the taught walkthrough once in the canonical language, then
    translate it into the others, in place.

    Never raises -- a canonical-language failure leaves every language with
    whatever the main brief call already produced (unchanged fallback); a
    single translation failure leaves just that language with the fallback
    while the other two get the taught walkthrough.
    """
    try:
        canonical = write_deep_dive(deep_dive, deep_dive_title, CANONICAL_LANGUAGE)
    except Exception as error:  # noqa: BLE001 -- walkthrough writing is an enhancement, never fail the run
        print(f"Deep-dive walkthrough 撰寫失敗（canonical），保留原本版本：{error}")
        return

    brief["translations"][CANONICAL_LANGUAGE]["sections"]["literatureDeepDive"] = canonical
    for language in LANGUAGES:
        if language == CANONICAL_LANGUAGE:
            continue
        try:
            brief["translations"][language]["sections"]["literatureDeepDive"] = translate_markdown(canonical, language)
        except Exception as error:  # noqa: BLE001 -- translation is an enhancement here, never fail the run
            print(f"Deep-dive walkthrough 翻譯失敗（{language}），保留原本版本：{error}")


def _write_concept_of_the_week(brief: dict, papers: list[dict], news: list[dict]) -> None:
    """Select and write Concept of the Week once in the canonical language,
    then translate it, in place.

    Selection happening exactly once is the actual point of this rewrite --
    independent per-language selection previously let each language pick a
    different concept for the same issue. A missing field (canonical or a
    translation failed after retries) is a valid, expected outcome --
    conceptOfTheWeek is optional by design (see
    docs/architecture/news-automation.md), not a run failure.
    """
    try:
        canonical = write_concept_of_the_week(papers, news, CANONICAL_LANGUAGE)
    except Exception as error:  # noqa: BLE001 -- concept writing is optional, never fail the run
        print(f"Concept of the Week 撰寫失敗（canonical），本週略過此欄位：{error}")
        return

    brief["translations"][CANONICAL_LANGUAGE]["conceptOfTheWeek"] = canonical
    for language in LANGUAGES:
        if language == CANONICAL_LANGUAGE:
            continue
        try:
            brief["translations"][language]["conceptOfTheWeek"] = translate_markdown(canonical, language)
        except Exception as error:  # noqa: BLE001 -- translation is optional here, never fail the run
            print(f"Concept of the Week 翻譯失敗（{language}），本週該語言略過此欄位：{error}")


def _build_qa_report(brief: dict, papers: list[dict], news: list[dict], deep_dive: dict | None) -> dict:
    """Return {language: report}, best-effort per language.

    A missing language entry (critic call failed after retries) is a valid
    outcome -- the QA report is a review aid for /admin, not a publish gate,
    so it never blocks the run the way a missing report might suggest.
    """
    qa_report: dict[str, dict] = {}
    for language, translation in brief["translations"].items():
        try:
            qa_report[language] = review_translation(translation, papers, news, deep_dive, language)
        except Exception as error:  # noqa: BLE001 -- QA review is optional, never fail the run
            print(f"QA report 產生失敗（{language}），本週該語言略過：{error}")
    return qa_report


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

    if supabase is not None and not args.force:
        papers = filter_seen(papers, supabase)
        news = filter_seen(news, supabase)

    selected = select_top_items(papers, news)
    if selected is None:
        print("本週相關內容不足（papers < 3 且 news < 2），跳過生成。")
        return 0

    if args.dry_run:
        print(f"Dry run 完成。選出 {len(selected['papers'])} 篇論文、{len(selected['news'])} 則新聞。")
        return 0

    deep_dive = None
    deep_dive_title = ""
    deep_dive_arxiv_id = None
    if selected["papers"]:
        assert supabase is not None
        deep_dive_candidate = selected["papers"][0]  # already sorted by score descending
        deep_dive = _get_deep_dive_analysis(supabase, deep_dive_candidate)
        if deep_dive is not None:
            deep_dive_title = deep_dive_candidate["title"]
            deep_dive_arxiv_id = deep_dive_candidate["arxiv_id"]

    prompts, prompt_hash = build_prompts(
        selected["papers"], selected["news"], week_label, deep_dive=deep_dive, deep_dive_title=deep_dive_title
    )
    brief = _generate_valid_brief(prompts)

    if deep_dive is not None:
        _write_deep_dive_walkthroughs(brief, deep_dive, deep_dive_title)

    _write_concept_of_the_week(brief, selected["papers"], selected["news"])

    qa_report = _build_qa_report(brief, selected["papers"], selected["news"], deep_dive)

    title = brief["translations"]["zh-TW"]["title"]

    assert supabase is not None
    draft_id = save_draft(
        supabase,
        {
            "week_label": week_label,
            "title": title,
            "content_md": serialize_brief(brief),
            "sources": _build_sources(selected["papers"], selected["news"]),
            "model": GENERATION_MODEL,
            "prompt_hash": prompt_hash,
            "qa_report": qa_report,
            "deep_dive_arxiv_id": deep_dive_arxiv_id,
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
