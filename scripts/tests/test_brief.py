from __future__ import annotations

import json

import pytest

from scripts.generation.brief import BRIEF_FORMAT, parse_generated_brief


def _brief() -> dict:
    def translation() -> dict:
        return {
            "title": "Title",
            "summary": "Summary",
            "sections": {
                "weeklyNews": "News",
                "selectedPapers": "Papers",
                "literatureDeepDive": "Deep read",
            },
        }

    return {
        "format": BRIEF_FORMAT,
        "contentType": "markdown",
        "translations": {language: translation() for language in ("zh-TW", "en", "fr")},
    }


def test_parses_complete_multilingual_brief() -> None:
    parsed = parse_generated_brief(json.dumps(_brief()))
    assert parsed["translations"]["fr"]["sections"]["literatureDeepDive"] == "Deep read"


def test_accepts_json_code_fence() -> None:
    parsed = parse_generated_brief(f"```json\n{json.dumps(_brief())}\n```")
    assert parsed["format"] == BRIEF_FORMAT


def test_rejects_a_missing_language() -> None:
    brief = _brief()
    del brief["translations"]["fr"]
    with pytest.raises(ValueError, match="missing the fr translation"):
        parse_generated_brief(json.dumps(brief))


def test_rejects_an_empty_section() -> None:
    brief = _brief()
    brief["translations"]["en"]["sections"]["selectedPapers"] = ""
    with pytest.raises(ValueError, match="selectedPapers must be non-empty"):
        parse_generated_brief(json.dumps(brief))


def test_rejects_an_overlong_summary() -> None:
    brief = _brief()
    brief["translations"]["fr"]["summary"] = "x" * 501
    with pytest.raises(ValueError, match="must not exceed 500 characters"):
        parse_generated_brief(json.dumps(brief))
