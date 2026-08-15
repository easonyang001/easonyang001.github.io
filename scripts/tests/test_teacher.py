from __future__ import annotations

import json

import pytest

from scripts.generation import teacher

DEEP_DIVE = {
    "research_question": "Does the method improve accuracy?",
    "motivation": "Existing methods are slow.",
    "research_gap": "No prior work handles this case.",
    "core_contribution": "A new hybrid circuit.",
    "method": {
        "core_idea": "Encode features as rotation angles.",
        "quantum_component": "4-qubit variational circuit.",
        "classical_component": "Adam optimizer.",
    },
    "experiments": {"datasets": ["MNIST"], "baselines": [], "metrics": [], "hardware_or_simulator": "simulator"},
    "key_results": ["+0.8% accuracy vs MLP"],
    "author_claims": ["Competitive with classical baselines."],
    "limitations": ["No matched-parameter baseline."],
    "unsupported_or_weak_claims": ["Quantum advantage"],
    "evidence": [{"claim": "Quantum advantage", "evidence": "No matched baseline", "strength": "unsupported"}],
}


def _walkthrough_json(*, empty: bool = False) -> str:
    return json.dumps({"literatureDeepDive": "" if empty else "## 30-Second Overview\nSome walkthrough text."})


def test_build_teacher_prompt_includes_facts_and_language() -> None:
    prompt = teacher.build_teacher_prompt(DEEP_DIVE, "A Great Paper", "fr")
    assert "A Great Paper" in prompt
    assert "Encode features as rotation angles." in prompt
    assert "No matched-parameter baseline." in prompt
    assert "French" in prompt


def test_parse_deep_dive_accepts_valid_response() -> None:
    content = teacher.parse_deep_dive(_walkthrough_json())
    assert "30-Second Overview" in content


def test_parse_deep_dive_accepts_code_fence() -> None:
    content = teacher.parse_deep_dive(f"```json\n{_walkthrough_json()}\n```")
    assert "30-Second Overview" in content


def test_parse_deep_dive_rejects_empty_content() -> None:
    with pytest.raises(ValueError, match="must be non-empty"):
        teacher.parse_deep_dive(_walkthrough_json(empty=True))


def test_parse_deep_dive_rejects_wrong_shape() -> None:
    with pytest.raises(ValueError, match="literatureDeepDive"):
        teacher.parse_deep_dive(json.dumps({"wrong_key": "text"}))


def test_parse_deep_dive_rejects_invalid_json() -> None:
    with pytest.raises(ValueError, match="invalid deep-dive JSON"):
        teacher.parse_deep_dive("not json")


def test_write_deep_dive_retries_after_a_bad_response(monkeypatch, capsys) -> None:
    responses = iter([_walkthrough_json(empty=True), _walkthrough_json()])
    monkeypatch.setattr(teacher, "generate_draft", lambda *args, **kwargs: next(responses))

    content = teacher.write_deep_dive(DEEP_DIVE, "A Great Paper", "en")

    assert "30-Second Overview" in content
    assert "未通過驗證" in capsys.readouterr().out


def test_write_deep_dive_gives_up_after_max_attempts(monkeypatch) -> None:
    monkeypatch.setattr(teacher, "generate_draft", lambda *args, **kwargs: _walkthrough_json(empty=True))

    with pytest.raises(ValueError, match="must be non-empty"):
        teacher.write_deep_dive(DEEP_DIVE, "A Great Paper", "en")
