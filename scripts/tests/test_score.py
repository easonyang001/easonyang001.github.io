from scripts.processing.score import score_item


def test_qubo_in_title_scores_5():
    item = {"title": "A QUBO formulation for routing", "abstract": ""}
    assert score_item(item, ["title", "abstract"]) == 5.0


def test_repeated_keyword_counts_once():
    item = {"title": "qubo", "abstract": "qubo qubo qubo"}
    assert score_item(item, ["title", "abstract"]) == 5.0


def test_case_insensitive():
    item = {"title": "QUBO", "abstract": ""}
    assert score_item(item, ["title", "abstract"]) == 5.0


def test_empty_string_scores_zero():
    item = {"title": "", "abstract": ""}
    assert score_item(item, ["title", "abstract"]) == 0


def test_cross_list_penalty_applied():
    item = {"title": "qubo", "abstract": "", "is_cross_list": True}
    assert score_item(item, ["title", "abstract"]) == 5.0 * 0.7
