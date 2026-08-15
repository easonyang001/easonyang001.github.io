from __future__ import annotations

import json

import pytest

from scripts.generation import translator

CANONICAL_BRIEF = {
    "title": "Title",
    "summary": "Summary",
    "sections": {
        "weeklyNews": "News",
        "selectedPapers": "Papers",
        "literatureDeepDive": "Deep read",
    },
}


def _brief_json(*, empty_section: bool = False) -> str:
    brief = json.loads(json.dumps(CANONICAL_BRIEF))
    if empty_section:
        brief["sections"]["selectedPapers"] = ""
    return json.dumps(brief)


def _markdown_json(*, empty: bool = False) -> str:
    return json.dumps({"translation": "" if empty else "## Titre\nContenu traduit."})


def test_build_brief_translation_prompt_includes_source_and_rules() -> None:
    prompt = translator.build_brief_translation_prompt(CANONICAL_BRIEF, "fr")
    assert "Deep read" in prompt
    assert "French" in prompt
    assert "Never add a claim" in prompt


def test_build_markdown_translation_prompt_includes_source_and_rules() -> None:
    prompt = translator.build_markdown_translation_prompt("## Heading\nBody text.", "zh-TW")
    assert "Body text." in prompt
    assert "Traditional Chinese" in prompt
    assert "Never shift evidence-strength framing" in prompt


def test_parse_brief_translation_accepts_valid_response() -> None:
    parsed = translator.parse_brief_translation(_brief_json(), "fr")
    assert parsed["sections"]["literatureDeepDive"] == "Deep read"


def test_parse_brief_translation_accepts_code_fence() -> None:
    parsed = translator.parse_brief_translation(f"```json\n{_brief_json()}\n```", "en")
    assert parsed["title"] == "Title"


def test_parse_brief_translation_rejects_incomplete_translation() -> None:
    with pytest.raises(ValueError, match="selectedPapers must be non-empty"):
        translator.parse_brief_translation(_brief_json(empty_section=True), "fr")


def test_parse_brief_translation_rejects_invalid_json() -> None:
    with pytest.raises(ValueError, match="invalid fr translation JSON"):
        translator.parse_brief_translation("not json", "fr")


def test_parse_markdown_translation_accepts_valid_response() -> None:
    content = translator.parse_markdown_translation(_markdown_json(), "fr")
    assert "Contenu traduit." in content


def test_parse_markdown_translation_accepts_code_fence() -> None:
    content = translator.parse_markdown_translation(f"```json\n{_markdown_json()}\n```", "fr")
    assert "Contenu traduit." in content


def test_parse_markdown_translation_rejects_empty_content() -> None:
    with pytest.raises(ValueError, match="must be non-empty"):
        translator.parse_markdown_translation(_markdown_json(empty=True), "fr")


def test_parse_markdown_translation_rejects_wrong_shape() -> None:
    with pytest.raises(ValueError, match="translation"):
        translator.parse_markdown_translation(json.dumps({"wrong_key": "text"}), "fr")


def test_translate_brief_translation_retries_after_a_bad_response(monkeypatch, capsys) -> None:
    responses = iter([_brief_json(empty_section=True), _brief_json()])
    monkeypatch.setattr(translator, "generate_draft", lambda *args, **kwargs: next(responses))

    result = translator.translate_brief_translation(CANONICAL_BRIEF, "fr")

    assert result["sections"]["selectedPapers"] == "Papers"
    assert "未通過驗證" in capsys.readouterr().out


def test_translate_brief_translation_gives_up_after_max_attempts(monkeypatch) -> None:
    monkeypatch.setattr(translator, "generate_draft", lambda *args, **kwargs: _brief_json(empty_section=True))

    with pytest.raises(ValueError, match="selectedPapers must be non-empty"):
        translator.translate_brief_translation(CANONICAL_BRIEF, "fr")


def test_translate_markdown_retries_after_a_bad_response(monkeypatch, capsys) -> None:
    responses = iter([_markdown_json(empty=True), _markdown_json()])
    monkeypatch.setattr(translator, "generate_draft", lambda *args, **kwargs: next(responses))

    content = translator.translate_markdown("## Heading\nBody.", "fr")

    assert "Contenu traduit." in content
    assert "未通過驗證" in capsys.readouterr().out


def test_translate_markdown_gives_up_after_max_attempts(monkeypatch) -> None:
    monkeypatch.setattr(translator, "generate_draft", lambda *args, **kwargs: _markdown_json(empty=True))

    with pytest.raises(ValueError, match="must be non-empty"):
        translator.translate_markdown("## Heading\nBody.", "fr")
