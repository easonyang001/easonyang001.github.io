from __future__ import annotations

import json

import pytest

from scripts.generation.brief import (
    BRIEF_FORMAT,
    assemble_brief,
    parse_generated_translation,
)


def _translation() -> dict:
    return {
        "title": "Title",
        "summary": "Summary",
        "sections": {
            "weeklyNews": "News",
            "selectedPapers": "Papers",
            "literatureDeepDive": "Deep read",
        },
    }


def test_parses_a_complete_translation() -> None:
    parsed = parse_generated_translation("fr", json.dumps(_translation()))
    assert parsed["sections"]["literatureDeepDive"] == "Deep read"


def test_accepts_json_code_fence() -> None:
    parsed = parse_generated_translation("en", f"```json\n{json.dumps(_translation())}\n```")
    assert parsed["title"] == "Title"


def test_rejects_an_empty_section() -> None:
    translation = _translation()
    translation["sections"]["selectedPapers"] = ""
    with pytest.raises(ValueError, match="selectedPapers must be non-empty"):
        parse_generated_translation("en", json.dumps(translation))


def test_rejects_an_overlong_summary() -> None:
    translation = _translation()
    translation["summary"] = "x" * 501
    with pytest.raises(ValueError, match="must not exceed 500 characters"):
        parse_generated_translation("fr", json.dumps(translation))


def test_rejects_invalid_json() -> None:
    with pytest.raises(ValueError, match="invalid en translation JSON"):
        parse_generated_translation("en", "not json")


def test_assemble_brief_combines_translations_by_language() -> None:
    translations = {language: _translation() for language in ("zh-TW", "en", "fr")}
    brief = assemble_brief(translations)
    assert brief["format"] == BRIEF_FORMAT
    assert brief["contentType"] == "markdown"
    assert brief["translations"]["fr"]["sections"]["literatureDeepDive"] == "Deep read"
