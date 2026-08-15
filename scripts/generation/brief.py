"""Validation and serialization for multilingual weekly research briefs."""

from __future__ import annotations

import json

BRIEF_FORMAT = "mrama-weekly-brief-v1"
LANGUAGES = ("zh-TW", "en", "fr")
SECTION_KEYS = ("weeklyNews", "selectedPapers", "literatureDeepDive")
TITLE_MAX_CHARS = 200
SUMMARY_MAX_CHARS = 500


def _strip_code_fence(raw: str) -> str:
    text = raw.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text


def validate_translation(language: str, translation: dict) -> None:
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


def parse_generated_translation(language: str, raw: str) -> dict:
    """Parse a single-language model response and reject incomplete or malformed translations.

    Each language is now generated in its own OpenAI call (see
    scripts/generation/prompt.py) so that the full brief's worth of content
    doesn't have to fit three languages into one response's token ceiling.
    """
    text = _strip_code_fence(raw)
    try:
        translation = json.loads(text)
    except json.JSONDecodeError as error:
        raise ValueError(f"OpenAI returned invalid {language} translation JSON") from error

    if not isinstance(translation, dict):
        raise ValueError(f"Weekly brief {language} translation must be an object")
    validate_translation(language, translation)
    return translation


def assemble_brief(translations: dict[str, dict]) -> dict:
    """Combine per-language translations (already validated) into a full brief."""
    return {"format": BRIEF_FORMAT, "contentType": "markdown", "translations": translations}


def serialize_brief(brief: dict) -> str:
    return json.dumps(brief, ensure_ascii=False, indent=2)
