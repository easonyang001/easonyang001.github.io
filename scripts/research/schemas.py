"""Validation and parsing for the Paper Intelligence analysis record.

Trimmed version of the "Canonical Paper Intelligence Schema" from the news
pipeline redesign spec -- only the fields that actually feed the
literatureDeepDive prompt are required. Everything else (extra metadata,
richer confidence scores, etc.) is deferred to a later phase.
"""

from __future__ import annotations

import json

PAPER_INTELLIGENCE_FORMAT = "mrama-paper-intelligence-v1"

REQUIRED_TEXT_FIELDS = (
    "research_question",
    "motivation",
    "research_gap",
    "core_contribution",
)
REQUIRED_METHOD_FIELDS = ("core_idea", "quantum_component", "classical_component")
# Lists may legitimately be empty -- e.g. a paper reporting no baselines is
# itself a fact worth keeping ("Not reported" per the spec's rule against
# fabricating detail), not a validation failure.
LIST_FIELDS = ("key_results", "author_claims", "limitations", "unsupported_or_weak_claims", "evidence")


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


def validate_paper_intelligence(data: dict) -> None:
    """Raise ValueError naming the first missing/malformed field."""
    if not isinstance(data, dict):
        raise ValueError("Paper intelligence response must be a JSON object")

    for field in REQUIRED_TEXT_FIELDS:
        if not isinstance(data.get(field), str) or not data[field].strip():
            raise ValueError(f"Paper intelligence.{field} must be a non-empty string")

    method = data.get("method")
    if not isinstance(method, dict):
        raise ValueError("Paper intelligence.method must be an object")
    for field in REQUIRED_METHOD_FIELDS:
        if not isinstance(method.get(field), str) or not method[field].strip():
            raise ValueError(f"Paper intelligence.method.{field} must be a non-empty string")

    experiments = data.get("experiments")
    if not isinstance(experiments, dict):
        raise ValueError("Paper intelligence.experiments must be an object")

    for field in LIST_FIELDS:
        if not isinstance(data.get(field), list):
            raise ValueError(f"Paper intelligence.{field} must be a list (can be empty)")


def parse_paper_intelligence(raw: str) -> dict:
    """Parse and validate a single analyze_paper model response."""
    text = _strip_code_fence(raw)
    try:
        data = json.loads(text)
    except json.JSONDecodeError as error:
        raise ValueError("OpenAI returned invalid paper intelligence JSON") from error

    validate_paper_intelligence(data)
    return data


def assemble_paper_intelligence(analysis: dict) -> dict:
    return {"format": PAPER_INTELLIGENCE_FORMAT, "analysis": analysis}


def serialize_paper_intelligence(record: dict) -> str:
    return json.dumps(record, ensure_ascii=False, indent=2)
