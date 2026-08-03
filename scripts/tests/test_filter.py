from scripts.processing.filter import select_top_items


def _papers(scores):
    return [{"arxiv_id": str(i), "score": s} for i, s in enumerate(scores)]


def _news(scores):
    return [{"url": f"https://example.com/{i}", "score": s} for i, s in enumerate(scores)]


def test_selects_top_n_correctly():
    result = select_top_items(_papers([5, 4, 3, 2, 1.5]), _news([3, 2]), max_papers=2, max_news=1)
    assert [p["score"] for p in result["papers"]] == [5, 4]
    assert [n["score"] for n in result["news"]] == [3]


def test_scores_below_one_are_filtered():
    result = select_top_items(_papers([5, 4, 3, 0.5]), _news([3, 2]))
    assert all(p["score"] >= 1.0 for p in result["papers"])
    assert len(result["papers"]) == 3


def test_insufficient_content_returns_none():
    result = select_top_items(_papers([5, 4]), _news([3]))
    assert result is None
