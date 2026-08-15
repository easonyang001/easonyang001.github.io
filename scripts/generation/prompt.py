"""Build the per-language prompts sent to OpenAI.

Each language is requested in its own API call rather than all three
crammed into one JSON response -- gpt-4o-mini's 16384-token output ceiling
can't reliably fit a full weeklyNews + selectedPapers + literatureDeepDive
brief three times over in a single response, which was causing systematic
truncation. Generating one language per call gives each one the full token
budget to itself.
"""

from __future__ import annotations

import hashlib

from scripts.generation.brief import LANGUAGES

ABSTRACT_MAX_CHARS = 800
MAX_AUTHORS_SHOWN = 3

LANGUAGE_LABELS = {
    "zh-TW": "Traditional Chinese",
    "en": "English",
    "fr": "French",
}

SYSTEM_TEMPLATE = """You are the research editor for Mrama Institute.
Create the {language_label} translation of a weekly quantum research brief for {week_label} using only the supplied sources.

STRICT EDITORIAL RULES
1. Use only claims supported by the supplied source titles, snippets, and abstracts. Never add outside facts.
2. State that every arXiv item is a preprint that has not been peer reviewed.
3. Avoid hype such as breakthrough, revolutionary, or disruptive unless the source explicitly supports it.
4. Attribute every item by its exact source title and include the supplied URL as a Markdown link.
5. Clearly distinguish reported results from editorial interpretation. Omit uncertain details.
6. Keep author names and affiliations in their original form.
7. Every section value must be non-empty. selectedPapers and literatureDeepDive intentionally cover overlapping papers -- never shorten or omit a section because its content is also covered elsewhere.

REQUIRED DOCUMENT
Return one JSON object only, written in {language_label}. Do not wrap it in a Markdown code fence.
Use this exact shape and include every field:
{{
  "title": "{language_label} issue title",
  "summary": "2-3 sentence issue summary",
  "sections": {{
    "weeklyNews": "Markdown",
    "selectedPapers": "Markdown",
    "literatureDeepDive": "Markdown"
  }}
}}

SECTION REQUIREMENTS
- weeklyNews: 3-5 items when sources permit. For each item, structure it with these subsections, using only what the supplied title/snippet/source actually say:
  - What Happened (REQUIRED, every item): the concrete fact.
  - Why It Matters (REQUIRED, every item): context for why a quantum-computing reader should care. Even a thin item has some reason it was included -- say what that is in one sentence rather than omitting this subsection.
  - What the Numbers Mean (OPTIONAL): only if the item states an actual metric (qubit count, performance gain, funding amount, etc.) -- explain what it does and does not imply. Omit this subsection entirely if the item states no metric.
  - What to Be Careful About (OPTIONAL): caveats that genuinely apply (e.g. company announcement vs. peer-reviewed research, physical vs. logical qubits, simulator vs. real hardware, no independent verification). Omit or keep to one line for routine items (funding rounds, partnerships, hires) that don't carry those caveats.
  The two OPTIONAL subsections are what "do not pad with generic filler" applies to -- a thin item (e.g. a stock-price blurb with no technical claim) should skip those two, not the REQUIRED ones. What Happened and Why It Matters must appear for every item regardless of how thin the source is. Always link the source.
- selectedPapers: 4-6 papers when sources permit. For each, summarize the question, method, result, and limitation. Include the arXiv link and peer-review warning.
- literatureDeepDive: {literature_deep_dive_instruction} Be explicit when a source does not provide enough detail for a given point rather than inferring it. This section is republished on its own as a standalone "Paper Deep Dive" article, so it must read as a complete, self-contained piece independent of the weeklyNews and selectedPapers sections.
- A paper covered in literatureDeepDive must still get its own full entry in selectedPapers. Do not treat coverage in one section as a reason to shorten, merge, or skip it in the other -- each section is read independently by different readers.
- Use Markdown paragraphs and lists inside each section value, but do not repeat section headings inside the values.
- Aim for useful synthesis rather than a list of rewritten titles.

SUPPLIED SOURCES

=== PAPERS ({paper_count}) ===
{formatted_papers}

=== NEWS ({news_count}) ===
{formatted_news}
{deep_dive_block}"""

DEFAULT_DEEP_DIVE_INSTRUCTION = (
    "choose the 2-3 most significant supplied papers (fewer only if fewer are supplied). "
    "For each, use its own sub-heading and cover: research question, method, evidence/results, "
    "limitations, and why it matters."
)

DEEP_DIVE_SOURCE_INSTRUCTION = (
    "write about the paper supplied below in the DEEP DIVE SOURCE block, which has been read and "
    "analyzed in full (not just its abstract). Use only that paper -- do not substitute or add others. "
    "Structure it as: research question, method, evidence/results, limitations, and why it matters, "
    "grounded in the full-text analysis supplied. Where the analysis marks something \"Not reported\", "
    "say so rather than filling it in."
)

DEEP_DIVE_SOURCE_TEMPLATE = """
=== DEEP DIVE SOURCE ({title}, full-text analysis) ===
Research question: {research_question}
Motivation: {motivation}
Research gap: {research_gap}
Core contribution: {core_contribution}
Method: {method_core_idea}
Quantum component: {method_quantum_component}
Classical component: {method_classical_component}
Datasets: {experiments_datasets}
Baselines: {experiments_baselines}
Metrics: {experiments_metrics}
Hardware/simulator: {experiments_hardware}
Key results: {key_results}
Author claims: {author_claims}
Limitations: {limitations}
Claims not well supported by evidence: {unsupported_or_weak_claims}
Evidence assessment: {evidence}
"""


def _format_authors(authors: list[str]) -> str:
    shown = authors[:MAX_AUTHORS_SHOWN]
    suffix = " et al." if len(authors) > MAX_AUTHORS_SHOWN else ""
    return ", ".join(shown) + suffix


def format_papers(papers: list[dict]) -> str:
    blocks = [
        f"ID: {p['arxiv_id']}\n"
        f"Title: {p['title']}\n"
        f"Authors: {_format_authors(p['authors'])}\n"
        f"URL: {p['url']}\n"
        f"Abstract: {p['abstract'][:ABSTRACT_MAX_CHARS]}\n"
        "---"
        for p in papers
    ]
    return "\n".join(blocks)


def format_news(news: list[dict]) -> str:
    blocks = [
        f"Source: {n['source']}\nTitle: {n['title']}\nURL: {n['url']}\nSnippet: {n['snippet']}\n---"
        for n in news
    ]
    return "\n".join(blocks)


def _format_list(items: list[str]) -> str:
    return "; ".join(items) if items else "Not reported"


def _format_evidence(evidence: list[dict]) -> str:
    if not evidence:
        return "Not reported"
    return "; ".join(f"{e['claim']} -> {e['evidence']} ({e['strength']})" for e in evidence)


def format_deep_dive(deep_dive: dict | None, title: str) -> str:
    if deep_dive is None:
        return ""
    method = deep_dive["method"]
    experiments = deep_dive["experiments"]
    return DEEP_DIVE_SOURCE_TEMPLATE.format(
        title=title,
        research_question=deep_dive["research_question"],
        motivation=deep_dive["motivation"],
        research_gap=deep_dive["research_gap"],
        core_contribution=deep_dive["core_contribution"],
        method_core_idea=method["core_idea"],
        method_quantum_component=method["quantum_component"],
        method_classical_component=method["classical_component"],
        experiments_datasets=_format_list(experiments.get("datasets", [])),
        experiments_baselines=_format_list(experiments.get("baselines", [])),
        experiments_metrics=_format_list(experiments.get("metrics", [])),
        experiments_hardware=experiments.get("hardware_or_simulator", "Not reported"),
        key_results=_format_list(deep_dive["key_results"]),
        author_claims=_format_list(deep_dive["author_claims"]),
        limitations=_format_list(deep_dive["limitations"]),
        unsupported_or_weak_claims=_format_list(deep_dive["unsupported_or_weak_claims"]),
        evidence=_format_evidence(deep_dive["evidence"]),
    )


def build_prompts(
    papers: list[dict],
    news: list[dict],
    week_label: str,
    deep_dive: dict | None = None,
    deep_dive_title: str = "",
) -> tuple[dict[str, str], str]:
    """Build one OpenAI prompt per language and return ({language: prompt}, prompt_hash).

    `deep_dive` is an optional Paper Intelligence analysis (see
    scripts/research/paper_analyzer.py) for the week's full-text-analyzed
    paper. When supplied, literatureDeepDive is grounded in that analysis
    instead of the model picking papers from abstracts alone; when it's
    None (full-text retrieval failed, or no candidate this week), the
    prompt falls back to exactly the prior abstract-only behavior.
    """
    formatted_papers = format_papers(papers)
    formatted_news = format_news(news)
    deep_dive_block = format_deep_dive(deep_dive, deep_dive_title)
    literature_deep_dive_instruction = (
        DEEP_DIVE_SOURCE_INSTRUCTION if deep_dive is not None else DEFAULT_DEEP_DIVE_INSTRUCTION
    )

    prompts = {
        language: SYSTEM_TEMPLATE.format(
            language_label=LANGUAGE_LABELS[language],
            week_label=week_label,
            paper_count=len(papers),
            formatted_papers=formatted_papers,
            news_count=len(news),
            formatted_news=formatted_news,
            deep_dive_block=deep_dive_block,
            literature_deep_dive_instruction=literature_deep_dive_instruction,
        )
        for language in LANGUAGES
    }
    combined = "\n".join(prompts[language] for language in LANGUAGES)
    prompt_hash = hashlib.sha256(combined.encode("utf-8")).hexdigest()
    return prompts, prompt_hash
