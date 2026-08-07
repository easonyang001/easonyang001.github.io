from __future__ import annotations

import json
import sys

import pytest

from scripts import generate_news


def _brief_json(*, empty_section: bool = False) -> str:
    def translation() -> dict:
        return {
            "title": "Title",
            "summary": "Summary",
            "sections": {
                "weeklyNews": "News",
                "selectedPapers": "" if empty_section else "Papers",
                "literatureDeepDive": "Deep read",
            },
        }

    brief = {
        "format": "mrama-weekly-brief-v1",
        "contentType": "markdown",
        "translations": {language: translation() for language in ("zh-TW", "en", "fr")},
    }
    return json.dumps(brief)


def test_dry_run_does_not_initialize_supabase_or_openai(monkeypatch, capsys) -> None:
    papers = [
        {"arxiv_id": f"paper-{index}", "title": f"Quantum paper {index}", "abstract": "quantum"}
        for index in range(3)
    ]

    monkeypatch.setattr(sys, "argv", ["generate_news.py", "--dry-run"])
    monkeypatch.setattr(generate_news, "fetch_arxiv_papers", lambda days_back: papers)
    monkeypatch.setattr(generate_news, "fetch_news_items", lambda: [])
    monkeypatch.setattr(generate_news, "score_item", lambda item, fields: 1.0)
    monkeypatch.setattr(
        generate_news,
        "init_supabase_client",
        lambda: (_ for _ in ()).throw(AssertionError("Supabase must not initialize during dry-run")),
    )
    monkeypatch.setattr(
        generate_news,
        "generate_draft",
        lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("OpenAI must not run during dry-run")),
    )

    assert generate_news.main() == 0
    assert "Dry run" in capsys.readouterr().out


def test_generate_valid_brief_retries_after_a_bad_response(monkeypatch, capsys) -> None:
    # An empty section is stochastic content quality (the model returned
    # well-formed but incomplete JSON), not a network failure -- confirm
    # this is retried as its own layer, separate from generate_draft's
    # timeout handling.
    responses = iter([_brief_json(empty_section=True), _brief_json()])
    monkeypatch.setattr(generate_news, "generate_draft", lambda *args, **kwargs: next(responses))

    brief = generate_news._generate_valid_brief("prompt")

    assert brief["translations"]["zh-TW"]["sections"]["selectedPapers"] == "Papers"
    assert "未通過驗證" in capsys.readouterr().out


def test_generate_valid_brief_gives_up_after_max_attempts(monkeypatch) -> None:
    monkeypatch.setattr(generate_news, "generate_draft", lambda *args, **kwargs: _brief_json(empty_section=True))

    with pytest.raises(ValueError, match="selectedPapers must be non-empty"):
        generate_news._generate_valid_brief("prompt")
