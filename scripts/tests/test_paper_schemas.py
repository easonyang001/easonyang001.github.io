from __future__ import annotations

import json

import pytest

from scripts.research.schemas import (
    PAPER_INTELLIGENCE_FORMAT,
    assemble_paper_intelligence,
    parse_paper_intelligence,
    validate_paper_intelligence,
)


def _analysis() -> dict:
    return {
        "research_question": "Does the method improve accuracy?",
        "motivation": "Existing methods are slow.",
        "research_gap": "No prior work handles this case.",
        "core_contribution": "A new hybrid circuit.",
        "method": {
            "core_idea": "Encode features as rotation angles.",
            "quantum_component": "4-qubit variational circuit.",
            "classical_component": "Adam optimizer.",
        },
        "experiments": {
            "datasets": ["MNIST"],
            "baselines": ["MLP"],
            "metrics": ["accuracy"],
            "hardware_or_simulator": "simulator",
        },
        "key_results": ["+0.8% accuracy vs MLP"],
        "author_claims": ["The method is competitive with classical baselines."],
        "limitations": ["No matched-parameter baseline."],
        "unsupported_or_weak_claims": ["Quantum advantage"],
        "evidence": [{"claim": "Quantum advantage", "evidence": "No matched baseline", "strength": "unsupported"}],
    }


def test_parses_a_complete_analysis() -> None:
    parsed = parse_paper_intelligence(json.dumps(_analysis()))
    assert parsed["research_question"] == "Does the method improve accuracy?"


def test_accepts_json_code_fence() -> None:
    parsed = parse_paper_intelligence(f"```json\n{json.dumps(_analysis())}\n```")
    assert parsed["core_contribution"] == "A new hybrid circuit."


def test_allows_empty_lists() -> None:
    analysis = _analysis()
    analysis["limitations"] = []
    analysis["evidence"] = []
    parsed = parse_paper_intelligence(json.dumps(analysis))
    assert parsed["limitations"] == []


def test_rejects_missing_required_text_field() -> None:
    analysis = _analysis()
    del analysis["research_question"]
    with pytest.raises(ValueError, match="research_question must be a non-empty string"):
        validate_paper_intelligence(analysis)


def test_rejects_missing_method_field() -> None:
    analysis = _analysis()
    del analysis["method"]["quantum_component"]
    with pytest.raises(ValueError, match="method.quantum_component"):
        validate_paper_intelligence(analysis)


def test_rejects_non_list_evidence() -> None:
    analysis = _analysis()
    analysis["evidence"] = "not a list"
    with pytest.raises(ValueError, match="evidence must be a list"):
        validate_paper_intelligence(analysis)


def test_rejects_invalid_json() -> None:
    with pytest.raises(ValueError, match="invalid paper intelligence JSON"):
        parse_paper_intelligence("not json")


def test_assemble_paper_intelligence_wraps_format() -> None:
    record = assemble_paper_intelligence(_analysis())
    assert record["format"] == PAPER_INTELLIGENCE_FORMAT
    assert record["analysis"]["core_contribution"] == "A new hybrid circuit."
