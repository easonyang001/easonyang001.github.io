"""Turn a paper's parsed full-text sections into a Paper Intelligence record.

One OpenAI call per paper, same model/timeout/retry machinery as the weekly
brief (scripts/generation/writer.py::generate_draft) -- that function is
already agnostic to what JSON shape it returns. Validation failures are
retried the same way scripts/generate_news.py retries a bad brief
translation: a malformed-but-well-formed response is stochastic content
quality, not a network failure, so it gets its own small retry budget on top
of generate_draft's own timeout retry.
"""

from __future__ import annotations

import hashlib

from scripts.generation.writer import generate_draft
from scripts.research.schemas import parse_paper_intelligence

MAX_ANALYZE_ATTEMPTS = 3
ANALYSIS_MODEL = "gpt-4o-mini"

SECTION_ORDER = (
    "introduction",
    "related_work",
    "method",
    "experiments",
    "results",
    "discussion",
    "limitations",
    "conclusion",
)

SYSTEM_TEMPLATE = """You are a research analyst extracting a structured, evidence-based intelligence record from a full academic paper. This record will directly ground a public-facing article, so precision matters more than completeness.

STRICT RULES
1. Use only what the supplied sections actually say. If a detail (e.g. dataset size, number of seeds, hardware used) is not reported, write "Not reported" rather than inferring or guessing it.
2. Separate what the authors claim from what the evidence in Results/Experiments actually supports. Populate "evidence" with each significant claim, the evidence for it, and a strength rating.
3. "strength" must be one of: strong, moderate, weak, unsupported.
4. List real limitations found in or inferable from the text (e.g. missing baselines, small sample size, simulator-only, no statistical test) -- do not write generic boilerplate like "future work is needed".
5. Do not use hype language (breakthrough, revolutionary, state-of-the-art, groundbreaking) unless the paper's own text uses it, and even then attribute it as the authors' framing, not fact.

PAPER METADATA
Title: {title}
Authors: {authors}
URL: {url}

PAPER SECTIONS
{formatted_sections}

REQUIRED DOCUMENT
Return one JSON object only. Do not wrap it in a Markdown code fence. Use this exact shape and include every field (lists may be empty if genuinely not reported):
{{
  "research_question": "what problem the paper sets out to solve",
  "motivation": "why this problem matters",
  "research_gap": "what existing approaches don't address",
  "core_contribution": "the paper's main new contribution",
  "method": {{
    "core_idea": "the central idea of the approach",
    "quantum_component": "what part of the method is quantum, or 'None' if classical-only",
    "classical_component": "what part of the method is classical"
  }},
  "experiments": {{
    "datasets": ["..."],
    "baselines": ["..."],
    "metrics": ["..."],
    "hardware_or_simulator": "e.g. 'simulator', 'IBM Q hardware', or 'Not reported'"
  }},
  "key_results": ["..."],
  "author_claims": ["..."],
  "limitations": ["..."],
  "unsupported_or_weak_claims": ["..."],
  "evidence": [
    {{"claim": "...", "evidence": "...", "strength": "strong | moderate | weak | unsupported"}}
  ]
}}
"""


def _format_sections(sections: dict[str, str]) -> str:
    blocks = [f"=== {key.upper()} ===\n{sections[key]}" for key in SECTION_ORDER if sections.get(key)]
    return "\n\n".join(blocks) if blocks else "(No sections could be extracted from the full text.)"


def _format_authors(authors: list[str]) -> str:
    return ", ".join(authors) if authors else "Not reported"


def build_analysis_prompt(paper: dict, sections: dict[str, str]) -> str:
    return SYSTEM_TEMPLATE.format(
        title=paper["title"],
        authors=_format_authors(paper.get("authors", [])),
        url=paper["url"],
        formatted_sections=_format_sections(sections),
    )


def compute_analysis_prompt_hash(paper: dict, sections: dict[str, str]) -> str:
    """Hash of the exact analysis prompt, used as the paper_intelligence cache key.

    Changes whenever the paper's extracted sections change (e.g. a new arXiv
    version) or the prompt template itself changes -- either case should
    trigger re-analysis rather than serving a stale cached record.
    """
    prompt = build_analysis_prompt(paper, sections)
    return hashlib.sha256(prompt.encode("utf-8")).hexdigest()


def analyze_paper(paper: dict, sections: dict[str, str]) -> dict:
    """Return a validated Paper Intelligence dict, retrying on validation failure."""
    prompt = build_analysis_prompt(paper, sections)

    last_error: ValueError | None = None
    for attempt in range(1, MAX_ANALYZE_ATTEMPTS + 1):
        try:
            generated = generate_draft(prompt, model=ANALYSIS_MODEL)
            return parse_paper_intelligence(generated)
        except ValueError as error:
            last_error = error
            print(f"論文分析未通過驗證（第 {attempt} 次嘗試，{paper.get('arxiv_id')}）：{error}")
    assert last_error is not None
    raise last_error
