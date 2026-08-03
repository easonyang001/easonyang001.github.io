"""Score papers and news by relevance to Mrama's research areas."""

from __future__ import annotations

KEYWORD_WEIGHTS = {
    # High relevance -- Mrama's core research.
    "qubo": 5.0,
    "quantum annealing": 5.0,
    "reverse annealing": 5.0,
    "quantum optimization": 4.0,
    "quantum machine learning": 4.0,
    "variational quantum": 3.0,
    "qaoa": 3.0,
    "vqe": 3.0,
    "ising": 3.0,
    "combinatorial optimization": 3.0,
    # Medium relevance.
    "quantum computing": 2.0,
    "quantum circuit": 2.0,
    "quantum error": 2.0,
    "entanglement": 1.5,
    "qubit": 1.5,
    # Low relevance (too broad on its own).
    "quantum": 0.5,
}

CROSS_LIST_PENALTY = 0.7


def score_item(item: dict, text_fields: list[str]) -> float:
    """Score an item by keyword presence across the given text fields.

    Each keyword contributes its weight at most once per item, regardless of
    how many times it appears or in how many fields.
    """
    haystack = " ".join(str(item.get(field, "") or "") for field in text_fields).lower()

    score = sum(weight for keyword, weight in KEYWORD_WEIGHTS.items() if keyword in haystack)

    if item.get("is_cross_list"):
        score *= CROSS_LIST_PENALTY

    return score
