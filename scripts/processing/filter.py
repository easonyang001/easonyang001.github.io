"""Select top items by score.

Expects each item dict to already carry a "score" field (see score.py).
"""

from __future__ import annotations

MIN_SCORE = 1.0
MIN_PAPERS = 3
MIN_NEWS = 2


def select_top_items(
    papers: list[dict], news: list[dict], max_papers: int = 8, max_news: int = 5
) -> dict | None:
    """Return the top-scoring papers and news items, or None if there isn't enough content this week."""
    relevant_papers = [p for p in papers if p.get("score", 0) >= MIN_SCORE]
    relevant_news = [n for n in news if n.get("score", 0) >= MIN_SCORE]

    if len(relevant_papers) < MIN_PAPERS and len(relevant_news) < MIN_NEWS:
        return None

    top_papers = sorted(relevant_papers, key=lambda p: p["score"], reverse=True)[:max_papers]
    top_news = sorted(relevant_news, key=lambda n: n["score"], reverse=True)[:max_news]

    return {"papers": top_papers, "news": top_news}
