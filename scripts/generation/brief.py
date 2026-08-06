"""Validation and serialization for multilingual weekly research briefs."""

from __future__ import annotations

import json

BRIEF_FORMAT = "mrama-weekly-brief-v1"
LANGUAGES = ("zh-TW", "en", "fr")
SECTION_KEYS = ("weeklyNews", "selectedPapers", "literatureDeepDive")
TITLE_MAX_CHARS = 200
SUMMARY_MAX_CHARS = 500


def parse_generated_brief(raw: str) -> dict:
    """Parse a model response and reject incomplete or malformed briefs."""
    text = raw.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    try:
        brief = json.loads(text)
    except json.JSONDecodeError as error:
        raise ValueError("OpenAI returned invalid weekly brief JSON") from error

    if not isinstance(brief, dict) or brief.get("format") != BRIEF_FORMAT:
        raise ValueError(f"Weekly brief format must be {BRIEF_FORMAT}")
    if brief.get("contentType") != "markdown":
        raise ValueError("Generated weekly brief contentType must be markdown")

    translations = brief.get("translations")
    if not isinstance(translations, dict):
        raise ValueError("Weekly brief translations must be an object")

    for language in LANGUAGES:
        translation = translations.get(language)
        if not isinstance(translation, dict):
            raise ValueError(f"Weekly brief is missing the {language} translation")
        for field, max_chars in (("title", TITLE_MAX_CHARS), ("summary", SUMMARY_MAX_CHARS)):
            if not isinstance(translation.get(field), str) or not translation[field].strip():
                raise ValueError(f"Weekly brief {language}.{field} must be a non-empty string")
            if len(translation[field]) > max_chars:
                raise ValueError(f"Weekly brief {language}.{field} must not exceed {max_chars} characters")
        sections = translation.get("sections")
        if not isinstance(sections, dict):
            raise ValueError(f"Weekly brief {language}.sections must be an object")
        for section in SECTION_KEYS:
            if not isinstance(sections.get(section), str) or not sections[section].strip():
                raise ValueError(f"Weekly brief {language}.sections.{section} must be non-empty")

    return brief


def serialize_brief(brief: dict) -> str:
    return json.dumps(brief, ensure_ascii=False, indent=2)
