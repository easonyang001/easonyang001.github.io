"""Build the prompt sent to OpenAI."""

from __future__ import annotations

import hashlib

ABSTRACT_MAX_CHARS = 800
MAX_AUTHORS_SHOWN = 3

SYSTEM_TEMPLATE = """You are the research editor for Mrama Institute.
Create a multilingual weekly quantum research brief for {week_label} using only the supplied sources.

STRICT EDITORIAL RULES
1. Use only claims supported by the supplied source titles, snippets, and abstracts. Never add outside facts.
2. State that every arXiv item is a preprint that has not been peer reviewed.
3. Avoid hype such as breakthrough, revolutionary, or disruptive unless the source explicitly supports it.
4. Attribute every item by its exact source title and include the supplied URL as a Markdown link.
5. Clearly distinguish reported results from editorial interpretation. Omit uncertain details.
6. Keep author names and affiliations in their original form.
7. The three translations must communicate the same evidence and conclusions.

REQUIRED DOCUMENT
Return one JSON object only. Do not wrap it in a Markdown code fence.
Use this exact shape and include every field:
{{
  "format": "mrama-weekly-brief-v1",
  "contentType": "markdown",
  "translations": {{
    "zh-TW": {{
      "title": "Traditional Chinese issue title",
      "summary": "2-3 sentence issue summary",
      "sections": {{
        "weeklyNews": "Markdown",
        "selectedPapers": "Markdown",
        "literatureDeepDive": "Markdown"
      }}
    }},
    "en": {{ "title": "...", "summary": "...", "sections": {{ "weeklyNews": "...", "selectedPapers": "...", "literatureDeepDive": "..." }} }},
    "fr": {{ "title": "...", "summary": "...", "sections": {{ "weeklyNews": "...", "selectedPapers": "...", "literatureDeepDive": "..." }} }}
  }}
}}

SECTION REQUIREMENTS FOR EACH LANGUAGE
- weeklyNews: 3-5 items when sources permit. Summarize what happened, why it matters, and link the source.
- selectedPapers: 5-8 papers when sources permit. For each, summarize the question, method, result, and limitation. Include the arXiv link and peer-review warning.
- literatureDeepDive: choose the 2-4 most significant supplied papers (fewer only if fewer are supplied). For each, use its own sub-heading and cover: research question, method, evidence/results, limitations, and why it matters. Be explicit when the abstract does not provide enough detail for a given point rather than inferring it. This section is republished on its own as a standalone "Paper Deep Dive" article, so it must read as a complete, self-contained piece independent of the weeklyNews and selectedPapers sections.
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


def build_prompt(papers: list[dict], news: list[dict], week_label: str) -> tuple[str, str]:
    """Build the OpenAI prompt and return (prompt, prompt_hash)."""
    prompt = SYSTEM_TEMPLATE.format(
        week_label=week_label,
        paper_count=len(papers),
        formatted_papers=_format_papers(papers),
        news_count=len(news),
        formatted_news=_format_news(news),
    )
    prompt_hash = hashlib.sha256(prompt.encode("utf-8")).hexdigest()
    return prompt, prompt_hash
