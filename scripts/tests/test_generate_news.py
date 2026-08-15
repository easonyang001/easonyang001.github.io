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


def test_write_deep_dive_walkthroughs_writes_canonical_once_and_translates(monkeypatch) -> None:
    monkeypatch.setattr(generate_news, "write_deep_dive", lambda deep_dive, title, language: "canonical walkthrough")
    monkeypatch.setattr(generate_news, "translate_markdown", lambda text, language: f"{text} ({language})")

    brief = _brief_with_basic_deep_dive()
    generate_news._write_deep_dive_walkthroughs(brief, {}, "Paper title")

    assert brief["translations"]["en"]["sections"]["literatureDeepDive"] == "canonical walkthrough"
    assert brief["translations"]["zh-TW"]["sections"]["literatureDeepDive"] == "canonical walkthrough (zh-TW)"
    assert brief["translations"]["fr"]["sections"]["literatureDeepDive"] == "canonical walkthrough (fr)"


def test_write_deep_dive_walkthroughs_keeps_basic_version_when_canonical_fails(monkeypatch, capsys) -> None:
    def boom(deep_dive, title, language):
        raise ValueError("model refused")

    monkeypatch.setattr(generate_news, "write_deep_dive", boom)

    brief = _brief_with_basic_deep_dive()
    generate_news._write_deep_dive_walkthroughs(brief, {}, "Paper title")

    for language in ("zh-TW", "en", "fr"):
        assert brief["translations"][language]["sections"]["literatureDeepDive"] == f"basic {language} version"
    assert "保留原本版本" in capsys.readouterr().out


def test_write_deep_dive_walkthroughs_keeps_basic_version_for_a_language_whose_translation_fails(
    monkeypatch, capsys
) -> None:
    monkeypatch.setattr(generate_news, "write_deep_dive", lambda deep_dive, title, language: "canonical walkthrough")

    def maybe_boom(text, language):
        if language == "fr":
            raise ValueError("model refused")
        return f"{text} ({language})"

    monkeypatch.setattr(generate_news, "translate_markdown", maybe_boom)

    brief = _brief_with_basic_deep_dive()
    generate_news._write_deep_dive_walkthroughs(brief, {}, "Paper title")

    assert brief["translations"]["en"]["sections"]["literatureDeepDive"] == "canonical walkthrough"
    assert brief["translations"]["zh-TW"]["sections"]["literatureDeepDive"] == "canonical walkthrough (zh-TW)"
    assert brief["translations"]["fr"]["sections"]["literatureDeepDive"] == "basic fr version"
    assert "保留原本版本" in capsys.readouterr().out


def _brief_without_concept() -> dict:
    return {"translations": {language: {"sections": {}} for language in ("zh-TW", "en", "fr")}}


def test_write_concept_of_the_week_selects_once_and_translates(monkeypatch) -> None:
    # The point of this rewrite: selection happens exactly once (canonical),
    # not independently per language, so every language describes the same
    # concept -- previously each language's independent selection could
    # pick a different one.
    monkeypatch.setattr(generate_news, "write_concept_of_the_week", lambda papers, news, language: "canonical concept")
    monkeypatch.setattr(generate_news, "translate_markdown", lambda text, language: f"{text} ({language})")

    brief = _brief_without_concept()
    generate_news._write_concept_of_the_week(brief, [], [])

    assert brief["translations"]["en"]["conceptOfTheWeek"] == "canonical concept"
    assert brief["translations"]["zh-TW"]["conceptOfTheWeek"] == "canonical concept (zh-TW)"
    assert brief["translations"]["fr"]["conceptOfTheWeek"] == "canonical concept (fr)"


def test_write_concept_of_the_week_leaves_field_absent_when_canonical_fails(monkeypatch, capsys) -> None:
    def boom(papers, news, language):
        raise ValueError("model refused")

    monkeypatch.setattr(generate_news, "write_concept_of_the_week", boom)

    brief = _brief_without_concept()
    generate_news._write_concept_of_the_week(brief, [], [])

    for language in ("zh-TW", "en", "fr"):
        assert "conceptOfTheWeek" not in brief["translations"][language]
    assert "略過此欄位" in capsys.readouterr().out


def test_write_concept_of_the_week_leaves_field_absent_for_a_language_whose_translation_fails(
    monkeypatch, capsys
) -> None:
    monkeypatch.setattr(generate_news, "write_concept_of_the_week", lambda papers, news, language: "canonical concept")

    def maybe_boom(text, language):
        if language == "fr":
            raise ValueError("model refused")
        return f"{text} ({language})"

    monkeypatch.setattr(generate_news, "translate_markdown", maybe_boom)

    brief = _brief_without_concept()
    generate_news._write_concept_of_the_week(brief, [], [])

    assert brief["translations"]["en"]["conceptOfTheWeek"] == "canonical concept"
    assert brief["translations"]["zh-TW"]["conceptOfTheWeek"] == "canonical concept (zh-TW)"
    assert "conceptOfTheWeek" not in brief["translations"]["fr"]
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


def test_generate_valid_brief_generates_canonical_once_and_translates(monkeypatch) -> None:
    # Phase 6: only the canonical (English) language is independently
    # generated; zh-TW/fr come from translating that canonical result, not
    # from their own independent generation -- this is what actually fixes
    # cross-language divergence (e.g. concept.py picking a different topic
    # per language under the old independent-per-language approach).
    generate_draft_calls: list[str] = []

    def fake_generate_draft(prompt, **kwargs):
        generate_draft_calls.append(prompt)
        return _translation_json()

    translate_calls: list[str] = []

    def fake_translate(canonical, language):
        translate_calls.append(language)
        return {**canonical, "title": f"{canonical['title']} ({language})"}

    monkeypatch.setattr(generate_news, "generate_draft", fake_generate_draft)
    monkeypatch.setattr(generate_news, "translate_brief_translation", fake_translate)

    brief = generate_news._generate_valid_brief({"zh-TW": "zh-TW prompt", "en": "en prompt", "fr": "fr prompt"})

    assert generate_draft_calls == ["en prompt"]  # only the canonical language calls the model directly
    assert set(translate_calls) == {"zh-TW", "fr"}
    assert set(brief["translations"]) == {"zh-TW", "en", "fr"}
    assert brief["translations"]["fr"]["title"] == "Title (fr)"


def test_generate_valid_brief_propagates_a_translation_failure(monkeypatch) -> None:
    # Unlike the optional enrichments (deep-dive walkthrough, concept of the
    # week), the core brief sections are required -- a translation failure
    # must fail the run rather than silently save a two-language draft the
    # frontend would reject outright.
    monkeypatch.setattr(generate_news, "generate_draft", lambda prompt, **kwargs: _translation_json())
    monkeypatch.setattr(
        generate_news,
        "translate_brief_translation",
        lambda canonical, language: (_ for _ in ()).throw(ValueError("translation refused")),
    )

    with pytest.raises(ValueError, match="translation refused"):
        generate_news._generate_valid_brief({"zh-TW": "zh-TW prompt", "en": "en prompt", "fr": "fr prompt"})
