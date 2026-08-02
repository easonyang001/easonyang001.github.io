import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "python"))

from validate import validate  # noqa: E402

EXAMPLES = ROOT / "examples"


def load(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def test_minimal_is_valid():
    report = validate(load(EXAMPLES / "minimal.json"), strict=False, public=False)
    assert report.errors == []


def test_full_is_valid():
    report = validate(load(EXAMPLES / "full.json"), strict=False, public=False)
    assert report.errors == []


def test_full_covers_every_figure_type():
    data = load(EXAMPLES / "full.json")
    types = {fig["type"] for fig in data["figures"]}
    assert types == {"series", "points", "matrix", "bars", "table", "beforeAfter", "image", "note"}


def test_minimal_strict_fails_on_missing_recommended_sections():
    report = validate(load(EXAMPLES / "minimal.json"), strict=True, public=False)
    assert report.errors  # optimality + alternatives warnings promoted to errors


INVALID_CASES = sorted((EXAMPLES / "invalid").glob("*.json"))


@pytest.mark.parametrize("path", INVALID_CASES, ids=lambda p: p.stem)
def test_invalid_case_is_rejected(path: Path):
    report = validate(load(path), strict=False, public=False)
    assert report.errors, f"{path.name} should have produced at least one error"


def test_bad_slug_points_at_meta_slug():
    report = validate(load(EXAMPLES / "invalid" / "bad-slug.json"), strict=False, public=False)
    assert any(f.pointer == "/meta/slug" for f in report.errors)


def test_missing_commit_points_at_reproduce():
    report = validate(load(EXAMPLES / "invalid" / "missing-commit.json"), strict=False, public=False)
    assert any(f.pointer == "/reproduce" for f in report.errors)


def test_direction_mismatch_detected():
    report = validate(load(EXAMPLES / "invalid" / "direction-mismatch.json"), strict=False, public=False)
    assert any("direction mismatch" in f.message for f in report.errors)


def test_median_out_of_range_detected():
    report = validate(load(EXAMPLES / "invalid" / "median-out-of-range.json"), strict=False, public=False)
    assert any(f.pointer == "/reliability/median" for f in report.errors)


def test_values_length_mismatch_detected():
    report = validate(load(EXAMPLES / "invalid" / "values-length-mismatch.json"), strict=False, public=False)
    assert any(f.pointer == "/reliability/values" for f in report.errors)


def test_value_arithmetic_mismatch_detected():
    report = validate(load(EXAMPLES / "invalid" / "value-arithmetic-mismatch.json"), strict=False, public=False)
    assert any("annualValue" in f.pointer for f in report.errors)


def test_optimality_impossible_detected():
    report = validate(load(EXAMPLES / "invalid" / "optimality-impossible.json"), strict=False, public=False)
    assert any(f.pointer == "/optimality/achievedValue" for f in report.errors)


def test_image_missing_alt_detected():
    report = validate(load(EXAMPLES / "invalid" / "image-missing-alt.json"), strict=False, public=False)
    assert any("alt" in f.message for f in report.errors)


def test_public_with_notes_detected():
    report = validate(load(EXAMPLES / "invalid" / "public-with-notes.json"), strict=False, public=False)
    assert any(f.pointer == "/notes" for f in report.errors)


def test_nan_in_series_detected():
    report = validate(load(EXAMPLES / "invalid" / "nan-in-series.json"), strict=False, public=False)
    assert any("NaN" in f.message for f in report.errors)


# ── Semantic warnings (not errors) ────────────────────────────────────────


def test_few_runs_warns():
    report = validate(load(EXAMPLES / "invalid" / "median-out-of-range.json"), strict=False, public=False)
    assert any(f.pointer == "/reliability/numRuns" for f in report.warnings)


def test_no_alternatives_warns():
    report = validate(load(EXAMPLES / "minimal.json"), strict=False, public=False)
    assert any(f.pointer == "/approach/alternatives" for f in report.warnings)


def test_no_optimality_warns():
    report = validate(load(EXAMPLES / "minimal.json"), strict=False, public=False)
    assert any(f.pointer == "/optimality" for f in report.warnings)


# ── PII scan (--public) ────────────────────────────────────────────────────


def _case_with(problem_summary_suffix: str) -> dict:
    data = load(EXAMPLES / "minimal.json")
    data["problem"]["summary"] += " " + problem_summary_suffix
    return data


def test_pii_scan_detects_email():
    report = validate(_case_with("Contact test@example.com."), strict=False, public=True)
    assert any("email" in f.message for f in report.warnings)


def test_pii_scan_detects_mobile_number():
    report = validate(_case_with("Call 0912345678."), strict=False, public=True)
    assert any("mobile" in f.message for f in report.warnings)


def test_pii_scan_detects_taiwan_id():
    report = validate(_case_with("ID A123456789."), strict=False, public=True)
    assert any("national ID" in f.message for f in report.warnings)


def test_pii_scan_detects_street_address():
    report = validate(_case_with("Near 忠孝東路100號."), strict=False, public=True)
    assert any("address" in f.message for f in report.warnings)


def test_pii_scan_does_not_print_matched_content(capsys):
    report = validate(_case_with("Contact secret-name@example.com."), strict=False, public=True)
    for f in report.warnings:
        assert "secret-name@example.com" not in f.message


def test_pii_scan_detects_real_coordinates():
    data = load(EXAMPLES / "minimal.json")
    data["figures"] = [
        {
            "type": "points",
            "heading": "test",
            "bounds": {"xMin": 0, "xMax": 1, "yMin": 0, "yMax": 1},
            "layers": [{"label": "x", "role": "muted", "points": [[121.5, 25.0]]}],
        }
    ]
    report = validate(data, strict=False, public=True)
    assert any("latitude" in f.message for f in report.warnings)


def test_pii_scan_off_by_default():
    report = validate(_case_with("Contact test@example.com."), strict=False, public=False)
    assert not any("email" in f.message for f in report.warnings)
