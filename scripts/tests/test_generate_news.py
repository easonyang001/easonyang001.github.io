from __future__ import annotations

import json
import sys

import pytest

from scripts import generate_news


def _translation_json(*, empty_section: bool = False) -> str:
    translation = {
        "title": "Title",
        "summary": "Summary",
        "sections": {
            "weeklyNews": "News",
            "selectedPapers": "" if empty_section else "Papers",
            "literatureDeepDive": "Deep read",
        },
    }
    return json.dumps(translation)


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


def test_generate_valid_translation_retries_after_a_bad_response(monkeypatch, capsys) -> None:
    # An empty section is stochastic content quality (the model returned
    # well-formed but incomplete JSON), not a network failure -- confirm
    # this is retried as its own layer, separate from generate_draft's
    # timeout handling.
    responses = iter([_translation_json(empty_section=True), _translation_json()])
    monkeypatch.setattr(generate_news, "generate_draft", lambda *args, **kwargs: next(responses))

    translation = generate_news._generate_valid_translation("en", "prompt")

    assert translation["sections"]["selectedPapers"] == "Papers"
    assert "未通過驗證" in capsys.readouterr().out


def test_generate_valid_translation_retries_when_generate_draft_itself_raises(monkeypatch) -> None:
    # generate_draft can raise ValueError directly too (e.g. a truncated,
    # unparseable response) -- that must be retried the same as a
    # well-formed-but-invalid response, not propagate straight out.
    calls = {"count": 0}

    def fake_generate_draft(*args, **kwargs):
        calls["count"] += 1
        if calls["count"] == 1:
            raise ValueError("OpenAI response was truncated by max_tokens before the brief JSON was complete")
        return _translation_json()

    monkeypatch.setattr(generate_news, "generate_draft", fake_generate_draft)

    translation = generate_news._generate_valid_translation("fr", "prompt")

    assert translation["title"] == "Title"
    assert calls["count"] == 2


def test_generate_valid_translation_gives_up_after_max_attempts(monkeypatch) -> None:
    monkeypatch.setattr(
        generate_news, "generate_draft", lambda *args, **kwargs: _translation_json(empty_section=True)
    )

    with pytest.raises(ValueError, match="selectedPapers must be non-empty"):
        generate_news._generate_valid_translation("zh-TW", "prompt")


def test_generate_valid_brief_generates_each_language_independently(monkeypatch) -> None:
    # One language failing validation on its first attempt shouldn't force
    # regenerating the other two languages -- each language has its own
    # prompt and its own retry budget.
    calls: dict[str, int] = {}

    def fake_generate_draft(prompt, **kwargs):
        language = prompt  # the fake prompts below are just the language code
        calls[language] = calls.get(language, 0) + 1
        if language == "en" and calls[language] == 1:
            return _translation_json(empty_section=True)
        return _translation_json()

    monkeypatch.setattr(generate_news, "generate_draft", fake_generate_draft)

    brief = generate_news._generate_valid_brief({"zh-TW": "zh-TW", "en": "en", "fr": "fr"})

    assert set(brief["translations"]) == {"zh-TW", "en", "fr"}
    assert calls == {"zh-TW": 1, "en": 2, "fr": 1}
