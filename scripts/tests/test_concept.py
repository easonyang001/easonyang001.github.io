from __future__ import annotations

import json

import pytest

from scripts.generation import concept

PAPERS = [
    {
        "arxiv_id": "2608.00001",
        "title": "Paper title",
        "authors": ["A. Author"],
        "url": "https://arxiv.org/abs/2608.00001",
        "abstract": "Paper abstract",
    }
]
NEWS = [{"source": "Publisher", "title": "News title", "url": "https://example.com/news", "snippet": "Summary"}]


def _concept_json(*, empty: bool = False) -> str:
    return json.dumps({"conceptOfTheWeek": "" if empty else "## In One Sentence\nSome concept text."})


def test_build_concept_prompt_includes_candidates_and_content() -> None:
    prompt = concept.build_concept_prompt(PAPERS, NEWS, "fr")
    assert "QUBO" in prompt
    assert "Paper title" in prompt
    assert "News title" in prompt
    assert "French" in prompt


def test_build_concept_prompt_handles_empty_papers_and_news() -> None:
    prompt = concept.build_concept_prompt([], [], "en")
    assert "(none)" in prompt


def test_parse_concept_accepts_valid_response() -> None:
    content = concept.parse_concept(_concept_json())
    assert "In One Sentence" in content


def test_parse_concept_accepts_code_fence() -> None:
    content = concept.parse_concept(f"```json\n{_concept_json()}\n```")
    assert "In One Sentence" in content


def test_parse_concept_rejects_empty_content() -> None:
    with pytest.raises(ValueError, match="must be non-empty"):
        concept.parse_concept(_concept_json(empty=True))


def test_parse_concept_rejects_wrong_shape() -> None:
    with pytest.raises(ValueError, match="conceptOfTheWeek"):
        concept.parse_concept(json.dumps({"wrong_key": "text"}))


def test_parse_concept_rejects_invalid_json() -> None:
    with pytest.raises(ValueError, match="invalid concept-of-the-week JSON"):
        concept.parse_concept("not json")


def test_write_concept_of_the_week_retries_after_a_bad_response(monkeypatch, capsys) -> None:
    responses = iter([_concept_json(empty=True), _concept_json()])
    monkeypatch.setattr(concept, "generate_draft", lambda *args, **kwargs: next(responses))

    content = concept.write_concept_of_the_week(PAPERS, NEWS, "en")

    assert "In One Sentence" in content
    assert "未通過驗證" in capsys.readouterr().out


def test_write_concept_of_the_week_gives_up_after_max_attempts(monkeypatch) -> None:
    monkeypatch.setattr(concept, "generate_draft", lambda *args, **kwargs: _concept_json(empty=True))

    with pytest.raises(ValueError, match="must be non-empty"):
        concept.write_concept_of_the_week(PAPERS, NEWS, "en")
