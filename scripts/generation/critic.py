"""QA review of a finished translation against its grounding sources.

Runs as its own OpenAI call per language, same reasoning as teacher.py and
concept.py -- a critic reviewing content in the same context it was written
in would be a materially weaker check than a fresh pass. This does NOT
auto-revise anything: the report is surfaced to the human reviewer in
/admin (see NewsDraftsAdmin.tsx), who already gates every draft before
publish. A failed critic call just means that language's report is absent,
never a failed generation run.
"""

from __future__ import annotations

import json

from scripts.generation.prompt import format_deep_dive, format_news, format_papers
from scripts.generation.writer import generate_draft

MAX_REVIEW_ATTEMPTS = 3
CRITIC_MODEL = "gpt-4o-mini"

LANGUAGE_LABELS = {"zh-TW": "Traditional Chinese", "en": "English", "fr": "French"}
VALID_STATUSES = ("pass", "needs_review")
LIST_FIELDS = ("unsupported_claims", "numerical_mismatches", "missing_caveats", "overclaiming", "other_issues")

CRITIC_SYSTEM_TEMPLATE = """You are a fact-checking editor reviewing a finished {language_label} weekly quantum brief before it goes to a human for final approval. You did not write this content -- review it critically against the grounding sources below, the same way an external fact-checker would.

WHAT TO CHECK
1. Unsupported claims: statements in the content not backed by the grounding sources.
2. Numerical mismatches: any number, metric, or count in the content that doesn't match the grounding sources.
3. Missing caveats: places where a caveat the sources support (e.g. preprint/not peer-reviewed, simulator vs. hardware, physical vs. logical qubits) is absent from the content.
4. Overclaiming: hype language (breakthrough, revolutionary, groundbreaking, proves, demonstrates) not justified by the sources' own framing.
5. Other issues: anything else a careful fact-checker would flag (unclear attribution, confusing author claims with verified findings, etc.)

ONE EXCEPTION: the "Concept of the Week" section (if present) is a general educational explainer, not a claim traceable to a specific source the way the other sections are. For it, only check for hype language and whether its "Why It Appears This Week" subsection genuinely connects to something in the grounding sources below -- do not flag it for lacking direct source support elsewhere in the explainer.

GROUNDING SOURCES (this week's actual papers/news, and the full-text paper analysis if one exists)

=== PAPERS ===
{formatted_papers}

=== NEWS ===
{formatted_news}
{deep_dive_block}

CONTENT TO REVIEW

=== weeklyNews ===
{weekly_news}

=== selectedPapers ===
{selected_papers}

=== literatureDeepDive ===
{literature_deep_dive}
{concept_block}

Return one JSON object only, in English regardless of the content's language (this report is for internal review, not publication). Do not wrap it in a Markdown code fence. Use this exact shape:
{{
  "status": "pass" or "needs_review",
  "score": 0.0 to 1.0,
  "unsupported_claims": ["..."],
  "numerical_mismatches": ["..."],
  "missing_caveats": ["..."],
  "overclaiming": ["..."],
  "other_issues": ["..."],
  "summary": "one paragraph overall assessment"
}}
Empty lists are fine and expected when nothing is wrong in that category. "status" should be "needs_review" whenever any list is non-empty with a genuine issue, not just for stylistic nitpicks.
"""


def build_critic_prompt(translation: dict, papers: list[dict], news: list[dict], deep_dive: dict | None, language: str) -> str:
    concept = translation.get("conceptOfTheWeek")
    concept_block = f"\n=== conceptOfTheWeek ===\n{concept}\n" if concept else ""
    return CRITIC_SYSTEM_TEMPLATE.format(
        language_label=LANGUAGE_LABELS[language],
        formatted_papers=format_papers(papers) if papers else "(none)",
        formatted_news=format_news(news) if news else "(none)",
        deep_dive_block=format_deep_dive(deep_dive, translation.get("title", "")),
        weekly_news=translation["sections"]["weeklyNews"],
        selected_papers=translation["sections"]["selectedPapers"],
        literature_deep_dive=translation["sections"]["literatureDeepDive"],
        concept_block=concept_block,
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


def parse_qa_report(raw: str) -> dict:
    text = _strip_code_fence(raw)
    try:
        data = json.loads(text)
    except json.JSONDecodeError as error:
        raise ValueError("OpenAI returned invalid QA report JSON") from error

    if not isinstance(data, dict):
        raise ValueError("QA report must be a JSON object")
    if data.get("status") not in VALID_STATUSES:
        raise ValueError(f"QA report status must be one of {VALID_STATUSES}")
    score = data.get("score")
    if not isinstance(score, (int, float)) or isinstance(score, bool) or not (0.0 <= score <= 1.0):
        raise ValueError("QA report score must be a number between 0 and 1")
    for field in LIST_FIELDS:
        if not isinstance(data.get(field), list):
            raise ValueError(f"QA report.{field} must be a list (can be empty)")
    if not isinstance(data.get("summary"), str) or not data["summary"].strip():
        raise ValueError("QA report summary must be a non-empty string")

    return data


def review_translation(
    translation: dict, papers: list[dict], news: list[dict], deep_dive: dict | None, language: str
) -> dict:
    """Return the validated QA report, retrying on validation failure."""
    prompt = build_critic_prompt(translation, papers, news, deep_dive, language)

    last_error: ValueError | None = None
    for attempt in range(1, MAX_REVIEW_ATTEMPTS + 1):
        try:
            generated = generate_draft(prompt, model=CRITIC_MODEL)
            return parse_qa_report(generated)
        except ValueError as error:
            last_error = error
            print(f"QA report 未通過驗證（{language}，第 {attempt} 次嘗試）：{error}")
    assert last_error is not None
    raise last_error
