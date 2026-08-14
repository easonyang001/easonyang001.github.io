"""Write the educational Research Walkthrough for the week's deep-dive paper.

Runs as its own OpenAI call per language, separate from the main weeklyNews
+ selectedPapers call in prompt.py. The walkthrough structure below (10
subsections) is too much to also ask for inside that shared call without
risking the same per-language 16k output-token ceiling that already broke
this pipeline once (see docs/architecture/news-automation.md) -- giving it
a full budget of its own is the same fix applied a second time, on purpose.
"""

from __future__ import annotations

import json

from scripts.generation.writer import generate_draft

MAX_WRITE_ATTEMPTS = 3
TEACHER_MODEL = "gpt-4o-mini"
MAX_WALKTHROUGH_CHARS = 20000

LANGUAGE_LABELS = {"zh-TW": "Traditional Chinese", "en": "English", "fr": "French"}

TEACHER_SYSTEM_TEMPLATE = """You are writing an educational "Research Walkthrough" in {language_label} about one paper, for Mrama Institute's weekly quantum brief. The reader may not have read the paper -- your job is that they finish understanding the problem, the method, the experiment, the results, and the limitations, not just a denser summary of the abstract.

STRICT RULES
1. Use only the supplied analysis below. If it says "Not reported", say so -- never invent a detail to fill a gap.
2. Never introduce a technical term without explaining it in plain language the first time it appears.
3. Use uncertainty language (suggests, indicates, is consistent with) rather than certainty language (proves, demonstrates) unless the evidence strength is "strong".
4. Explicitly separate what the results support from what they do not yet support -- do not blur author claims with verified findings.
5. Do not use hype words (breakthrough, revolutionary, groundbreaking) unless the source material itself uses them, and even then attribute it as the authors' framing.

PAPER: {title}

ANALYSIS (from full-text review)
Research question: {research_question}
Motivation: {motivation}
Research gap: {research_gap}
Core contribution: {core_contribution}
Method core idea: {method_core_idea}
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
Evidence assessment (claim -> evidence -> strength): {evidence}

REQUIRED STRUCTURE
Write one Markdown document (use ## for each of these headings, translated into {language_label}, in this order):

1. 30-Second Overview -- 150-250 words: what problem, what was tried, what happened, the most important caveat.
2. What You Need to Know First -- 2-4 prerequisite terms, each explained in one or two plain-language sentences.
3. The Research Problem -- what existing approaches don't handle, and what this paper set out to do.
4. Why This Problem Matters -- the real-world or scientific stakes.
5. Method — Step by Step -- walk the pipeline: input, what happens at each stage, where the quantum and classical parts each do their part, output. Write it so a reader without a quantum background can follow the shape of it even if not every detail.
6. Experimental Setup -- a Markdown table: Dataset, Baselines, Metrics, Hardware/Simulator. Use "Not reported" for anything the analysis doesn't give you.
7. Understanding the Results -- two clearly labeled subsections: "What the Results Support" and "What They Do NOT Yet Support". Ground both in the evidence assessment above, not just the author claims.
8. Limitations -- the real ones from the analysis, specific to this paper, not generic "more research is needed" filler.
9. If We Were Reviewing This Paper -- 2-4 genuine scientific questions that the evidence doesn't yet answer.
10. What You Should Learn From This Paper -- 3-5 transferable insights a careful reader should walk away with. Not a restatement of the key results.

Return one JSON object only, in this exact shape. Do not wrap it in a Markdown code fence:
{{
  "literatureDeepDive": "the full markdown document described above"
}}
"""


def _format_list(items: list[str]) -> str:
    return "; ".join(items) if items else "Not reported"


def _format_evidence(evidence: list[dict]) -> str:
    if not evidence:
        return "Not reported"
    return "; ".join(f"{e['claim']} -> {e['evidence']} ({e['strength']})" for e in evidence)


def build_teacher_prompt(deep_dive: dict, title: str, language: str) -> str:
    method = deep_dive["method"]
    experiments = deep_dive["experiments"]
    return TEACHER_SYSTEM_TEMPLATE.format(
        language_label=LANGUAGE_LABELS[language],
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


def parse_deep_dive(raw: str) -> str:
    text = _strip_code_fence(raw)
    try:
        data = json.loads(text)
    except json.JSONDecodeError as error:
        raise ValueError("OpenAI returned invalid deep-dive JSON") from error

    if not isinstance(data, dict) or not isinstance(data.get("literatureDeepDive"), str):
        raise ValueError("Deep-dive response must be {\"literatureDeepDive\": string}")

    content = data["literatureDeepDive"].strip()
    if not content:
        raise ValueError("literatureDeepDive must be non-empty")
    if len(content) > MAX_WALKTHROUGH_CHARS:
        raise ValueError(f"literatureDeepDive must not exceed {MAX_WALKTHROUGH_CHARS} characters")
    return content


def write_deep_dive(deep_dive: dict, title: str, language: str) -> str:
    """Return the validated walkthrough markdown, retrying on validation failure."""
    prompt = build_teacher_prompt(deep_dive, title, language)

    last_error: ValueError | None = None
    for attempt in range(1, MAX_WRITE_ATTEMPTS + 1):
        try:
            generated = generate_draft(prompt, model=TEACHER_MODEL)
            return parse_deep_dive(generated)
        except ValueError as error:
            last_error = error
            print(f"Deep-dive walkthrough 未通過驗證（{language}，第 {attempt} 次嘗試）：{error}")
    assert last_error is not None
    raise last_error
