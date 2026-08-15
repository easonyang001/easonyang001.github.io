from __future__ import annotations

import json

import pytest

from scripts.generation import critic

TRANSLATION = {
    "title": "Weekly Brief",
    "sections": {
        "weeklyNews": "Some news happened.",
        "selectedPapers": "A paper about QAOA.",
        "literatureDeepDive": "A deep dive into the QAOA paper.",
    },
}
PAPERS = [
    {
        "arxiv_id": "2608.00001",
        "title": "Paper title",
        "authors": ["A. Author"],
        "url": "https://arxiv.org/abs/2608.00001",
        "abstract": "Paper abstract",
    }
]
NEWS = [{"source": "Publisher", "title": "News title", "url": "https://example.com/news", "snippet": "Summary"}]


def _report_json(*, status: str = "pass", score: float = 0.9, bad_status: bool = False, bad_score: bool = False) -> str:
    report = {
        "status": "not-a-status" if bad_status else status,
        "score": 5.0 if bad_score else score,
        "unsupported_claims": [],
        "numerical_mismatches": [],
        "missing_caveats": [],
        "overclaiming": [],
        "other_issues": [],
        "summary": "Looks fine.",
    }
    return json.dumps(report)


def test_build_critic_prompt_includes_content_and_grounding() -> None:
    prompt = critic.build_critic_prompt(TRANSLATION, PAPERS, NEWS, None, "en")
    assert "A deep dive into the QAOA paper." in prompt
    assert "Paper title" in prompt
    assert "News title" in prompt
    assert "English" in prompt


def test_build_critic_prompt_includes_concept_when_present() -> None:
    translation = {**TRANSLATION, "conceptOfTheWeek": "## In One Sentence\nQAOA explained."}
    prompt = critic.build_critic_prompt(translation, PAPERS, NEWS, None, "en")
    assert "conceptOfTheWeek" in prompt
    assert "QAOA explained." in prompt


def test_build_critic_prompt_omits_concept_block_when_absent() -> None:
    prompt = critic.build_critic_prompt(TRANSLATION, PAPERS, NEWS, None, "en")
    assert "=== conceptOfTheWeek ===" not in prompt


def test_parse_qa_report_accepts_valid_response() -> None:
    report = critic.parse_qa_report(_report_json())
    assert report["status"] == "pass"
    assert report["score"] == 0.9


def test_parse_qa_report_accepts_code_fence() -> None:
    report = critic.parse_qa_report(f"```json\n{_report_json()}\n```")
    assert report["status"] == "pass"


def test_parse_qa_report_rejects_invalid_status() -> None:
    with pytest.raises(ValueError, match="status must be one of"):
        critic.parse_qa_report(_report_json(bad_status=True))


def test_parse_qa_report_rejects_out_of_range_score() -> None:
    with pytest.raises(ValueError, match="score must be a number between 0 and 1"):
        critic.parse_qa_report(_report_json(bad_score=True))


def test_parse_qa_report_rejects_wrong_shape() -> None:
    with pytest.raises(ValueError, match="QA report must be a JSON object"):
        critic.parse_qa_report(json.dumps(["not", "an", "object"]))


def test_parse_qa_report_rejects_invalid_json() -> None:
    with pytest.raises(ValueError, match="invalid QA report JSON"):
        critic.parse_qa_report("not json")


def test_review_translation_retries_after_a_bad_response(monkeypatch, capsys) -> None:
    responses = iter([_report_json(bad_status=True), _report_json(status="needs_review", score=0.4)])
    monkeypatch.setattr(critic, "generate_draft", lambda *args, **kwargs: next(responses))

    report = critic.review_translation(TRANSLATION, PAPERS, NEWS, None, "en")

    assert report["status"] == "needs_review"
    assert "未通過驗證" in capsys.readouterr().out


def test_review_translation_gives_up_after_max_attempts(monkeypatch) -> None:
    monkeypatch.setattr(critic, "generate_draft", lambda *args, **kwargs: _report_json(bad_status=True))

    with pytest.raises(ValueError, match="status must be one of"):
        critic.review_translation(TRANSLATION, PAPERS, NEWS, None, "en")
