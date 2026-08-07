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
- weeklyNews: 3-5 items when sources permit. Summarize what happened, why it matters, and link the source.
- selectedPapers: 4-6 papers when sources permit. For each, summarize the question, method, result, and limitation. Include the arXiv link and peer-review warning.
- literatureDeepDive: choose the 2-3 most significant supplied papers (fewer only if fewer are supplied). For each, use its own sub-heading and cover: research question, method, evidence/results, limitations, and why it matters. Be explicit when the abstract does not provide enough detail for a given point rather than inferring it. This section is republished on its own as a standalone "Paper Deep Dive" article, so it must read as a complete, self-contained piece independent of the weeklyNews and selectedPapers sections.
- A paper selected for literatureDeepDive must still get its own full entry in selectedPapers. Do not treat coverage in one section as a reason to shorten, merge, or skip it in the other -- each section is read independently by different readers.
- Use Markdown paragraphs and lists inside each section value, but do not repeat section headings inside the values.
- Aim for useful synthesis rather than a list of rewritten titles.

SUPPLIED SOURCES

=== PAPERS ({paper_count}) ===
{formatted_papers}

=== NEWS ({news_count}) ===
{formatted_news}
"""


def _format_authors(authors: list[str]) -> str:
    shown = authors[:MAX_AUTHORS_SHOWN]
    suffix = " et al." if len(authors) > MAX_AUTHORS_SHOWN else ""
    return ", ".join(shown) + suffix


def _format_papers(papers: list[dict]) -> str:
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


def _format_news(news: list[dict]) -> str:
    blocks = [
        f"Source: {n['source']}\nTitle: {n['title']}\nURL: {n['url']}\nSnippet: {n['snippet']}\n---"
        for n in news
    ]
    return "\n".join(blocks)


def build_prompts(papers: list[dict], news: list[dict], week_label: str) -> tuple[dict[str, str], str]:
    """Build one OpenAI prompt per language and return ({language: prompt}, prompt_hash)."""
    formatted_papers = _format_papers(papers)
    formatted_news = _format_news(news)

    prompts = {
        language: SYSTEM_TEMPLATE.format(
            language_label=LANGUAGE_LABELS[language],
            week_label=week_label,
            paper_count=len(papers),
            formatted_papers=formatted_papers,
            news_count=len(news),
            formatted_news=formatted_news,
        )
        for language in LANGUAGES
    }
    combined = "\n".join(prompts[language] for language in LANGUAGES)
    prompt_hash = hashlib.sha256(combined.encode("utf-8")).hexdigest()
    return prompts, prompt_hash
