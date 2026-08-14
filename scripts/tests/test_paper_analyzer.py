from __future__ import annotations

import json

import pytest

from scripts.research import paper_analyzer

PAPER = {"arxiv_id": "2607.12345", "title": "A Great Quantum Paper", "authors": ["Alice"], "url": "https://arxiv.org/abs/2607.12345"}
SECTIONS = {"introduction": "We study quantum optimization.", "method": "A variational circuit."}


def _analysis_json(*, missing_field: bool = False) -> str:
    analysis = {
        "research_question": "Does the method improve accuracy?",
        "motivation": "Existing methods are slow.",
        "research_gap": "No prior work handles this case.",
        "core_contribution": "A new hybrid circuit.",
        "method": {
            "core_idea": "Encode features as rotation angles.",
            "quantum_component": "" if missing_field else "4-qubit variational circuit.",
            "classical_component": "Adam optimizer.",
        },
        "experiments": {"datasets": [], "baselines": [], "metrics": [], "hardware_or_simulator": "simulator"},
        "key_results": ["+0.8% accuracy vs MLP"],
        "author_claims": [],
        "limitations": [],
        "unsupported_or_weak_claims": [],
        "evidence": [],
    }
    return json.dumps(analysis)


def test_build_analysis_prompt_includes_paper_and_sections() -> None:
    prompt = paper_analyzer.build_analysis_prompt(PAPER, SECTIONS)
    assert "A Great Quantum Paper" in prompt
    assert "quantum optimization" in prompt
    assert "variational circuit" in prompt


def test_compute_analysis_prompt_hash_is_deterministic() -> None:
    a = paper_analyzer.compute_analysis_prompt_hash(PAPER, SECTIONS)
    b = paper_analyzer.compute_analysis_prompt_hash(PAPER, SECTIONS)
    assert a == b


def test_compute_analysis_prompt_hash_changes_with_sections() -> None:
    a = paper_analyzer.compute_analysis_prompt_hash(PAPER, SECTIONS)
    b = paper_analyzer.compute_analysis_prompt_hash(PAPER, {**SECTIONS, "results": "New results text."})
    assert a != b


def test_analyze_paper_returns_validated_analysis(monkeypatch) -> None:
    monkeypatch.setattr(paper_analyzer, "generate_draft", lambda *args, **kwargs: _analysis_json())

    analysis = paper_analyzer.analyze_paper(PAPER, SECTIONS)

    assert analysis["core_contribution"] == "A new hybrid circuit."


def test_analyze_paper_retries_after_a_bad_response(monkeypatch, capsys) -> None:
    responses = iter([_analysis_json(missing_field=True), _analysis_json()])
    monkeypatch.setattr(paper_analyzer, "generate_draft", lambda *args, **kwargs: next(responses))

    analysis = paper_analyzer.analyze_paper(PAPER, SECTIONS)

    assert analysis["method"]["quantum_component"] == "4-qubit variational circuit."
    assert "未通過驗證" in capsys.readouterr().out


def test_analyze_paper_gives_up_after_max_attempts(monkeypatch) -> None:
    monkeypatch.setattr(paper_analyzer, "generate_draft", lambda *args, **kwargs: _analysis_json(missing_field=True))

    with pytest.raises(ValueError, match="method.quantum_component"):
        paper_analyzer.analyze_paper(PAPER, SECTIONS)
