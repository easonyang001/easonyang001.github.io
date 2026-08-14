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


_DEEP_DIVE_PAPER = {
    "arxiv_id": "2608.00001",
    "title": "Paper title",
    "authors": ["A. Author"],
    "url": "https://arxiv.org/abs/2608.00001",
}


def test_get_deep_dive_analysis_returns_none_when_full_text_unavailable(monkeypatch) -> None:
    monkeypatch.setattr(generate_news, "fetch_full_text", lambda arxiv_id: None)
    monkeypatch.setattr(
        generate_news,
        "analyze_paper",
        lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("must not analyze without full text")),
    )

    result = generate_news._get_deep_dive_analysis(object(), _DEEP_DIVE_PAPER)

    assert result is None


def test_get_deep_dive_analysis_uses_cache_without_reanalyzing(monkeypatch) -> None:
    cached = {"core_contribution": "cached"}
    monkeypatch.setattr(generate_news, "fetch_full_text", lambda arxiv_id: "<html></html>")
    monkeypatch.setattr(generate_news, "parse_sections", lambda html: {"introduction": "text"})
    monkeypatch.setattr(generate_news, "get_cached_paper_intelligence", lambda supabase, arxiv_id, prompt_hash: cached)
    monkeypatch.setattr(
        generate_news,
        "analyze_paper",
        lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("must not re-analyze a cache hit")),
    )

    result = generate_news._get_deep_dive_analysis(object(), _DEEP_DIVE_PAPER)

    assert result == cached


def test_get_deep_dive_analysis_never_raises_on_failure(monkeypatch, capsys) -> None:
    def boom(arxiv_id):
        raise RuntimeError("network exploded")

    monkeypatch.setattr(generate_news, "fetch_full_text", boom)

    result = generate_news._get_deep_dive_analysis(object(), _DEEP_DIVE_PAPER)

    assert result is None
    assert "退回摘要模式" in capsys.readouterr().out


def _brief_with_basic_deep_dive() -> dict:
    return {
        "translations": {
            language: {"sections": {"literatureDeepDive": f"basic {language} version"}}
            for language in ("zh-TW", "en", "fr")
        }
    }


def test_write_deep_dive_walkthroughs_overwrites_every_language(monkeypatch) -> None:
    monkeypatch.setattr(generate_news, "write_deep_dive", lambda deep_dive, title, language: f"taught {language}")

    brief = _brief_with_basic_deep_dive()
    generate_news._write_deep_dive_walkthroughs(brief, {}, "Paper title")

    for language in ("zh-TW", "en", "fr"):
        assert brief["translations"][language]["sections"]["literatureDeepDive"] == f"taught {language}"


def test_write_deep_dive_walkthroughs_keeps_basic_version_on_failure(monkeypatch, capsys) -> None:
    def boom(deep_dive, title, language):
        raise ValueError("model refused")

    monkeypatch.setattr(generate_news, "write_deep_dive", boom)

    brief = _brief_with_basic_deep_dive()
    generate_news._write_deep_dive_walkthroughs(brief, {}, "Paper title")

    for language in ("zh-TW", "en", "fr"):
        assert brief["translations"][language]["sections"]["literatureDeepDive"] == f"basic {language} version"
    assert "保留原本版本" in capsys.readouterr().out


def _brief_without_concept() -> dict:
    return {"translations": {language: {"sections": {}} for language in ("zh-TW", "en", "fr")}}


def test_write_concept_of_the_week_sets_field_per_language(monkeypatch) -> None:
    monkeypatch.setattr(
        generate_news, "write_concept_of_the_week", lambda papers, news, language: f"concept {language}"
    )

    brief = _brief_without_concept()
    generate_news._write_concept_of_the_week(brief, [], [])

    for language in ("zh-TW", "en", "fr"):
        assert brief["translations"][language]["conceptOfTheWeek"] == f"concept {language}"


def test_write_concept_of_the_week_leaves_field_absent_on_failure(monkeypatch, capsys) -> None:
    def boom(papers, news, language):
        raise ValueError("model refused")

    monkeypatch.setattr(generate_news, "write_concept_of_the_week", boom)

    brief = _brief_without_concept()
    generate_news._write_concept_of_the_week(brief, [], [])

    for language in ("zh-TW", "en", "fr"):
        assert "conceptOfTheWeek" not in brief["translations"][language]
    assert "略過此欄位" in capsys.readouterr().out


def _brief_for_qa() -> dict:
    return {"translations": {language: {"sections": {}} for language in ("zh-TW", "en", "fr")}}


def test_build_qa_report_collects_a_report_per_language(monkeypatch) -> None:
    monkeypatch.setattr(
        generate_news,
        "review_translation",
        lambda translation, papers, news, deep_dive, language: {"status": "pass", "language": language},
    )

    qa_report = generate_news._build_qa_report(_brief_for_qa(), [], [], None)

    assert set(qa_report) == {"zh-TW", "en", "fr"}
    assert qa_report["en"] == {"status": "pass", "language": "en"}


def test_build_qa_report_omits_a_language_whose_review_fails(monkeypatch, capsys) -> None:
    def maybe_boom(translation, papers, news, deep_dive, language):
        if language == "fr":
            raise ValueError("model refused")
        return {"status": "pass"}

    monkeypatch.setattr(generate_news, "review_translation", maybe_boom)

    qa_report = generate_news._build_qa_report(_brief_for_qa(), [], [], None)

    assert set(qa_report) == {"zh-TW", "en"}
    assert "fr" not in qa_report
    assert "QA report 產生失敗" in capsys.readouterr().out


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
