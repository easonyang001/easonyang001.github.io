#!/usr/bin/env python3
"""Validate a case.json against schema v1.

Three layers:
  1. Structure  -- JSON Schema (case.v1.schema.json)
  2. Semantics  -- cross-field consistency checks this repo's schema can't express
  3. Security   -- PII scan, only with --public (never prints matched content)

Zero framework dependency beyond `jsonschema`. Usable from any Python project.

Usage:
    python validate.py case.json
    python validate.py case.json --strict   # warnings also fail
    python validate.py case.json --public   # add the anonymization scan
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

from jsonschema import Draft202012Validator

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

SCHEMA_PATH = Path(__file__).resolve().parent.parent / "schema" / "case.v1.schema.json"


@dataclass
class Finding:
    level: str  # "error" | "warning"
    pointer: str
    message: str


@dataclass
class Report:
    findings: list[Finding] = field(default_factory=list)

    def error(self, pointer: str, message: str) -> None:
        self.findings.append(Finding("error", pointer, message))

    def warning(self, pointer: str, message: str) -> None:
        self.findings.append(Finding("warning", pointer, message))

    @property
    def errors(self) -> list[Finding]:
        return [f for f in self.findings if f.level == "error"]

    @property
    def warnings(self) -> list[Finding]:
        return [f for f in self.findings if f.level == "warning"]


# ── Layer 1: structure ───────────────────────────────────────────────────


def load_schema() -> dict:
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        return json.load(f)


def check_structure(data: dict, report: Report) -> None:
    validator = Draft202012Validator(load_schema())
    for err in sorted(validator.iter_errors(data), key=lambda e: list(e.path)):
        pointer = "/" + "/".join(str(p) for p in err.absolute_path)
        report.error(pointer or "/", err.message)


# ── Layer 2: semantics ───────────────────────────────────────────────────


def _get(data: dict, *path, default=None):
    cur = data
    for key in path:
        if not isinstance(cur, dict) or key not in cur:
            return default
        cur = cur[key]
    return cur


def check_semantics(data: dict, report: Report) -> None:
    _check_improvement_direction(data, report)
    _check_reliability(data, report)
    _check_value_arithmetic(data, report)
    _check_optimality(data, report)
    _check_figures_finite(data, report)
    _check_warnings(data, report)


def _check_improvement_direction(data: dict, report: Report) -> None:
    for idx, entry, base_pointer in _metric_entries(data):
        baseline = entry.get("baseline")
        achieved = entry.get("achieved")
        higher_is_better = entry.get("higherIsBetter")
        if None in (baseline, achieved, higher_is_better):
            continue
        if higher_is_better and achieved < baseline:
            report.error(
                base_pointer,
                "higherIsBetter is true but achieved < baseline (direction mismatch).",
            )
        elif not higher_is_better and achieved > baseline:
            report.error(
                base_pointer,
                "higherIsBetter is false but achieved > baseline (direction mismatch).",
            )


def _metric_entries(data: dict):
    primary = _get(data, "improvement", "primary")
    if primary is not None:
        yield 0, primary, "/improvement/primary"
    for i, entry in enumerate(_get(data, "improvement", "secondary", default=[]) or []):
        yield i, entry, f"/improvement/secondary/{i}"


def _check_reliability(data: dict, report: Report) -> None:
    rel = _get(data, "reliability")
    if not rel:
        return
    median = rel.get("median")
    lo = rel.get("min")
    hi = rel.get("max")
    if None not in (median, lo, hi) and not (lo <= median <= hi):
        report.error("/reliability/median", "median must lie within [min, max].")

    num_runs = rel.get("numRuns")
    values = rel.get("values")
    if num_runs is not None and values is not None and len(values) != num_runs:
        report.error(
            "/reliability/values",
            f"values has {len(values)} entries but numRuns is {num_runs}.",
        )

    if num_runs is not None and num_runs < 10:
        report.warning(
            "/reliability/numRuns",
            "numRuns < 10 -- reliability basis is thin for a randomized algorithm.",
        )


def _check_value_arithmetic(data: dict, report: Report) -> None:
    items = _get(data, "value", "items", default=[]) or []
    for i, item in enumerate(items):
        unit_value = item.get("unitValue")
        quantity = item.get("quantity")
        annual = item.get("annualValue")
        if None in (unit_value, quantity, annual):
            continue
        expected = unit_value * quantity
        tolerance = max(abs(expected) * 0.01, 1e-9)
        if abs(expected - annual) > tolerance:
            report.error(
                f"/value/items/{i}/annualValue",
                f"unitValue * quantity = {expected!r} but annualValue = {annual!r} "
                f"(exceeds 1% tolerance).",
            )
        if item.get("confidence") == "illustrative" and not _get(data, "value", "caveat"):
            report.warning(
                f"/value/items/{i}/confidence",
                "confidence is 'illustrative' but value.caveat is not set.",
            )


def _check_optimality(data: dict, report: Report) -> None:
    opt = _get(data, "optimality")
    if not opt:
        report.warning("/optimality", "No optimality block -- no optimality yardstick reported.")
        return
    bound = opt.get("boundValue")
    achieved = opt.get("achievedValue")
    if bound is not None and achieved is not None and achieved < bound:
        report.error(
            "/optimality/achievedValue",
            "achievedValue is better than boundValue, which is impossible -- "
            "boundValue is a limit on what's achievable.",
        )


def _check_figures_finite(data: dict, report: Report) -> None:
    for i, fig in enumerate(_get(data, "figures", default=[]) or []):
        if fig.get("type") != "series":
            continue
        for j, s in enumerate(fig.get("series", []) or []):
            for k, point in enumerate(s.get("data", []) or []):
                for coord in point if isinstance(point, list) else []:
                    if isinstance(coord, (int, float)) and not math.isfinite(coord):
                        report.error(
                            f"/figures/{i}/series/{j}/data/{k}",
                            "series data contains NaN or Infinity.",
                        )


def _check_warnings(data: dict, report: Report) -> None:
    alternatives = _get(data, "approach", "alternatives", default=[])
    if not alternatives:
        report.warning(
            "/approach/alternatives",
            "No alternatives recorded -- why this approach over others isn't documented.",
        )

    data_source = _get(data, "reproduce", "dataSource")
    data_note = _get(data, "reproduce", "dataNote")
    if data_source == "client" and not data_note:
        report.warning(
            "/reproduce/dataNote",
            "dataSource is 'client' but dataNote is empty.",
        )

    title = (_get(data, "meta", "title") or "") + " " + (_get(data, "meta", "oneLiner") or "")
    kind = _get(data, "approach", "chosen", "kind")
    if re.search(r"quantum|量子", title, re.IGNORECASE) and kind not in (
        "quantum_hardware",
        "quantum_simulated",
    ):
        report.warning(
            "/meta/title",
            "Title/oneLiner mentions quantum but approach.chosen.kind is "
            f"'{kind}' -- may mislead readers.",
        )


# ── Layer 3: security (--public only) ────────────────────────────────────

_PII_PATTERNS = {
    "Taiwan national ID": re.compile(r"\b[A-Za-z][12]\d{8}\b"),
    "mobile number": re.compile(r"\b09\d{8}\b"),
    "landline number": re.compile(r"\b0\d{1,2}-?\d{6,8}\b"),
    "email address": re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b"),
    "street address": re.compile(r"[一-鿿0-9]+(路|街|巷|弄|號)"),
    "business registration number": re.compile(r"\b\d{8}\b"),
}


def _load_pii_terms() -> list[str]:
    terms_file = Path.cwd() / ".pii-terms"
    if not terms_file.exists():
        return []
    return [line.strip() for line in terms_file.read_text(encoding="utf-8").splitlines() if line.strip()]


def _walk_strings(data, pointer=""):
    if isinstance(data, dict):
        for k, v in data.items():
            yield from _walk_strings(v, f"{pointer}/{k}")
    elif isinstance(data, list):
        for i, v in enumerate(data):
            yield from _walk_strings(v, f"{pointer}/{i}")
    elif isinstance(data, str):
        yield pointer, data


def _walk_points(data, pointer=""):
    """Find figures[].layers[].points / .data arrays of [x, y] pairs."""
    if isinstance(data, dict):
        for k, v in data.items():
            yield from _walk_points(v, f"{pointer}/{k}")
    elif isinstance(data, list):
        if data and all(
            isinstance(p, list) and len(p) == 2 and all(isinstance(c, (int, float)) for c in p)
            for p in data
        ):
            yield pointer, data
        else:
            for i, v in enumerate(data):
                yield from _walk_points(v, f"{pointer}/{i}")


def check_security(data: dict, report: Report) -> None:
    terms = _load_pii_terms()
    for pointer, text in _walk_strings(data):
        # Notes are excluded here on purpose: they're required to be null when
        # visibility=public, and that's already enforced structurally.
        for label, pattern in _PII_PATTERNS.items():
            if pattern.search(text):
                report.warning(pointer, f"possible {label} -- review before publishing.")
        for term in terms:
            if term and term.lower() in text.lower():
                report.warning(pointer, "matches a term in .pii-terms -- review before publishing.")

    # Real-world-looking coordinates (Taiwan lat/lon range) in points figures.
    for pointer, points in _walk_points(data.get("figures", [])):
        for x, y in points:
            if 119 <= x <= 122 and 21 <= y <= 26:
                report.warning(pointer, "possible real latitude/longitude -- review before publishing.")
                break


# ── CLI ───────────────────────────────────────────────────────────────────


def validate(data: dict, *, strict: bool, public: bool) -> Report:
    report = Report()
    check_structure(data, report)
    # Semantic checks assume the shapes structure already validated; skip them
    # if structure failed outright to avoid confusing cascades.
    if not report.errors:
        check_semantics(data, report)
    if public:
        check_security(data, report)
    if strict:
        report.findings = [
            Finding("error", f.pointer, f.message) if f.level == "warning" else f
            for f in report.findings
        ]
    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("case_file", type=Path)
    parser.add_argument("--strict", action="store_true", help="treat warnings as failures")
    parser.add_argument("--public", action="store_true", help="run the anonymization scan")
    args = parser.parse_args(argv)

    with open(args.case_file, encoding="utf-8") as f:
        data = json.load(f)

    report = validate(data, strict=args.strict, public=args.public)

    for f in report.findings:
        marker = "✗" if f.level == "error" else "⚠"
        print(f"{marker} {f.pointer}  {f.message}")

    if not report.findings:
        print(f"✓ {args.case_file} is valid.")

    return 1 if report.errors else 0


if __name__ == "__main__":
    sys.exit(main())
