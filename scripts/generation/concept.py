"""Select and write "Concept of the Week" -- one recurring quantum concept,
picked from a fixed vocabulary and explained standalone.

Runs as its own OpenAI call per language, same reasoning as
scripts/generation/teacher.py: an 8-subsection standalone article is too
much to also ask for inside the shared weeklyNews+selectedPapers call
without risking the per-language token ceiling. Selection and writing are
folded into one call (not split into concept_selector.py + concept_writer.py
as the redesign spec names them) because nothing downstream needs the bare
selection decision on its own -- only the finished article, same reasoning
already applied to folding evidence.py into paper_analyzer.py in Phase 1.
"""

from __future__ import annotations

import json

from scripts.generation.prompt import format_news, format_papers
from scripts.generation.writer import generate_draft

MAX_WRITE_ATTEMPTS = 3
CONCEPT_MODEL = "gpt-4o-mini"
MAX_CONCEPT_CHARS = 12000

LANGUAGE_LABELS = {"zh-TW": "Traditional Chinese", "en": "English", "fr": "French"}

CANDIDATE_CONCEPTS = (
    "Physical vs Logical Qubits",
    "Reverse Annealing",
    "QAOA Depth",
    "Quantum Advantage",
    "Barren Plateau",
    "Quantum Error Correction",
    "Matched-Parameter Baseline",
    "VQE (Variational Quantum Eigensolver)",
    "QUBO (Quadratic Unconstrained Binary Optimization)",
    "Ising Model",
    "Circuit Fidelity",
    "Error Mitigation",
)

CONCEPT_SYSTEM_TEMPLATE = """You are writing "Concept of the Week" in {language_label} for Mrama Institute's weekly quantum brief -- a short, standalone explainer of one quantum-computing concept, picked because it connects to something in this week's actual content below.

STEP 1 -- SELECT
Pick exactly one concept from this fixed list, whichever one this week's papers/news actually give you a real, specific reason to explain (not just a loose thematic fit):
{candidate_concepts}

STEP 2 -- WRITE
STRICT RULES
1. Explain the concept correctly and precisely -- do not simplify to the point of being misleading.
2. "Why It Appears This Week" must name the specific paper or news item that motivated picking this concept. If nothing this week genuinely connects to any concept on the list, pick the closest reasonable one and say plainly that the connection is loose.
3. Do not use hype language (breakthrough, revolutionary, groundbreaking).
4. Use uncertainty language (suggests, indicates) rather than certainty language (proves, demonstrates) when describing open or debated aspects of the concept.

REQUIRED STRUCTURE
Write one Markdown document (use ## for each of these headings, translated into {language_label}, in this order):
1. In One Sentence -- a single precise sentence defining the concept.
2. Intuition -- an explanation without formulas, using a concrete analogy if one genuinely clarifies rather than obscures.
3. How It Works -- step by step, in plain language.
4. Technical View -- the precise technical description, formulas only if they add real clarity, each one explained in words immediately after.
5. Example -- a concrete worked example.
6. Common Misunderstanding -- a specific, real misconception about this concept, corrected.
7. Why It Appears This Week -- the specific connection to this week's content (see rule 2).
8. Remember This -- one sentence takeaway.

THIS WEEK'S CONTENT

=== PAPERS ===
{formatted_papers}

=== NEWS ===
{formatted_news}

Return one JSON object only. Do not wrap it in a Markdown code fence:
{{
  "conceptOfTheWeek": "the full markdown document described above"
}}
"""


def build_concept_prompt(papers: list[dict], news: list[dict], language: str) -> str:
    return CONCEPT_SYSTEM_TEMPLATE.format(
        language_label=LANGUAGE_LABELS[language],
        candidate_concepts="\n".join(f"- {concept}" for concept in CANDIDATE_CONCEPTS),
        formatted_papers=format_papers(papers) if papers else "(none)",
        formatted_news=format_news(news) if news else "(none)",
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


def parse_concept(raw: str) -> str:
    text = _strip_code_fence(raw)
    try:
        data = json.loads(text)
    except json.JSONDecodeError as error:
        raise ValueError("OpenAI returned invalid concept-of-the-week JSON") from error

    if not isinstance(data, dict) or not isinstance(data.get("conceptOfTheWeek"), str):
        raise ValueError('Concept response must be {"conceptOfTheWeek": string}')

    content = data["conceptOfTheWeek"].strip()
    if not content:
        raise ValueError("conceptOfTheWeek must be non-empty")
    if len(content) > MAX_CONCEPT_CHARS:
        raise ValueError(f"conceptOfTheWeek must not exceed {MAX_CONCEPT_CHARS} characters")
    return content


def write_concept_of_the_week(papers: list[dict], news: list[dict], language: str) -> str:
    """Return the validated Concept of the Week markdown, retrying on validation failure."""
    prompt = build_concept_prompt(papers, news, language)

    last_error: ValueError | None = None
    for attempt in range(1, MAX_WRITE_ATTEMPTS + 1):
        try:
            generated = generate_draft(prompt, model=CONCEPT_MODEL)
            return parse_concept(generated)
        except ValueError as error:
            last_error = error
            print(f"Concept of the Week 未通過驗證（{language}，第 {attempt} 次嘗試）：{error}")
    assert last_error is not None
    raise last_error
