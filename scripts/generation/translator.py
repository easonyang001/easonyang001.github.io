"""Translate already-decided canonical (English) content into other languages.

Phase 6 of the news pipeline redesign: every generation step used to run as
3 fully independent per-language calls, each separately deciding facts,
wording, and editorial judgment -- including scripts/generation/concept.py,
which could pick a *different* Concept of the Week per language since
selection happened independently each time. Generating once in English and
translating fixes that by construction.

This module deliberately does NOT re-ground translations against the raw
papers/news sources -- that's scripts/generation/critic.py's job, and
duplicating it here would be redundant reasoning for a task that should be
mechanical. The translation rules below (never add/drop a claim or caveat,
never shift evidence-strength framing) are what keep a translation faithful
without needing to re-derive anything.
"""

from __future__ import annotations

import json

from scripts.generation.brief import validate_translation
from scripts.generation.writer import generate_draft

MAX_TRANSLATE_ATTEMPTS = 3
TRANSLATOR_MODEL = "gpt-4o-mini"
MAX_MARKDOWN_CHARS = 20000

LANGUAGE_LABELS = {"zh-TW": "Traditional Chinese", "en": "English", "fr": "French"}

TRANSLATION_RULES = """TRANSLATION RULES
1. Never add a claim, number, or caveat that isn't in the source text.
2. Never drop a caveat, limitation, or uncertainty qualifier present in the source text.
3. Never shift evidence-strength framing -- don't turn "suggests" into "proves", or "the authors report" into "research demonstrates".
4. Preserve all URLs, arXiv IDs, and numeric values exactly as given.
5. Preserve Markdown structure (headings, lists, tables) -- translate heading text but do not add, remove, or reorder headings or sections.
6. Translate meaning, not just words -- the result should read naturally in {language_label}, not like a literal word-for-word conversion."""

BRIEF_TRANSLATION_TEMPLATE = """You are translating a finished weekly quantum research brief from English into {language_label}. This is a translation task, not an editorial one -- every fact, claim, and caveat below has already been decided; your job is to carry it faithfully into {language_label}.

{translation_rules}

SOURCE (English)
{source_json}

Return one JSON object only, in {language_label}. Do not wrap it in a Markdown code fence. Use this exact shape and include every field:
{{
  "title": "...",
  "summary": "...",
  "sections": {{
    "weeklyNews": "...",
    "selectedPapers": "...",
    "literatureDeepDive": "..."
  }}
}}
"""

MARKDOWN_TRANSLATION_TEMPLATE = """You are translating a finished piece of educational content from English into {language_label}. This is a translation task, not an editorial one -- every fact, claim, and caveat below has already been decided; your job is to carry it faithfully into {language_label}.

{translation_rules}

SOURCE (English, Markdown)
{source_markdown}

Return one JSON object only, in {language_label}. Do not wrap it in a Markdown code fence:
{{
  "translation": "the full translated Markdown document"
}}
"""


def _rules(language: str) -> str:
    return TRANSLATION_RULES.format(language_label=LANGUAGE_LABELS[language])


def build_brief_translation_prompt(canonical: dict, target_language: str) -> str:
    return BRIEF_TRANSLATION_TEMPLATE.format(
        language_label=LANGUAGE_LABELS[target_language],
        translation_rules=_rules(target_language),
        source_json=json.dumps(canonical, ensure_ascii=False, indent=2),
    )


def build_markdown_translation_prompt(text: str, target_language: str) -> str:
    return MARKDOWN_TRANSLATION_TEMPLATE.format(
        language_label=LANGUAGE_LABELS[target_language],
        translation_rules=_rules(target_language),
        source_markdown=text,
    )


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


def parse_brief_translation(raw: str, target_language: str) -> dict:
    text = _strip_code_fence(raw)
    try:
        data = json.loads(text)
    except json.JSONDecodeError as error:
        raise ValueError(f"OpenAI returned invalid {target_language} translation JSON") from error

    if not isinstance(data, dict):
        raise ValueError(f"{target_language} translation must be a JSON object")
    validate_translation(target_language, data)
    return data


def parse_markdown_translation(raw: str, target_language: str) -> str:
    text = _strip_code_fence(raw)
    try:
        data = json.loads(text)
    except json.JSONDecodeError as error:
        raise ValueError(f"OpenAI returned invalid {target_language} translation JSON") from error

    if not isinstance(data, dict) or not isinstance(data.get("translation"), str):
        raise ValueError(f'{target_language} translation response must be {{"translation": string}}')

    content = data["translation"].strip()
    if not content:
        raise ValueError(f"{target_language} translation must be non-empty")
    if len(content) > MAX_MARKDOWN_CHARS:
        raise ValueError(f"{target_language} translation must not exceed {MAX_MARKDOWN_CHARS} characters")
    return content


def translate_brief_translation(canonical: dict, target_language: str) -> dict:
    """Translate the main brief's {title, summary, sections} dict, retrying on validation failure."""
    prompt = build_brief_translation_prompt(canonical, target_language)

    last_error: ValueError | None = None
    for attempt in range(1, MAX_TRANSLATE_ATTEMPTS + 1):
        try:
            generated = generate_draft(prompt, model=TRANSLATOR_MODEL)
            return parse_brief_translation(generated, target_language)
        except ValueError as error:
            last_error = error
            print(f"{target_language} 翻譯未通過驗證（第 {attempt} 次嘗試）：{error}")
    assert last_error is not None
    raise last_error


def translate_markdown(text: str, target_language: str) -> str:
    """Translate a standalone Markdown document, retrying on validation failure."""
    prompt = build_markdown_translation_prompt(text, target_language)

    last_error: ValueError | None = None
    for attempt in range(1, MAX_TRANSLATE_ATTEMPTS + 1):
        try:
            generated = generate_draft(prompt, model=TRANSLATOR_MODEL)
            return parse_markdown_translation(generated, target_language)
        except ValueError as error:
            last_error = error
            print(f"{target_language} 翻譯未通過驗證（第 {attempt} 次嘗試）：{error}")
    assert last_error is not None
    raise last_error
