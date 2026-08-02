# mrama-contract

The data contract between the experiment code (Python, structure free) and
the website (reads `case.json`, structure fixed). See `../claude.md`
Appendix F for the full design rationale — this README is just the
operating instructions.

```
your Python (any structure)  ──►  case.json (schema v1)  ──►  website
```

## Layout

```
schema/
  case.v1.schema.json   the one authoritative source
  CHANGELOG.md
examples/
  minimal.json           only the required fields
  full.json               every optional field, every figure type
  invalid/                 cases that must be rejected, one per rule
python/
  validate.py             zero-framework-dependency validator (needs `jsonschema`)
tests/
  test_validate.py
```

## Usage

```bash
pip install jsonschema pytest   # once
python python/validate.py path/to/case.json
python python/validate.py path/to/case.json --strict   # warnings also fail
python python/validate.py path/to/case.json --public   # + anonymization scan
```

Exit code is `0` if there are no errors (warnings alone don't fail unless
`--strict` is passed), `1` otherwise.

## The three validation layers

1. **Structure** — JSON Schema (`case.v1.schema.json`). Field presence,
   types, enums, the `image` figure's `alt`/`sourceData` requirement, and
   the `visibility: public` → `notes: null` rule.
2. **Semantics** — cross-field consistency the schema can't express:
   improvement direction vs. `higherIsBetter`, `reliability.median` inside
   `[min, max]`, `reliability.values` length matching `numRuns`, value-item
   arithmetic (`unitValue * quantity == annualValue`, 1% tolerance),
   `optimality.achievedValue` never beating `optimality.boundValue`, no
   `NaN`/`Infinity` in `figures[].type == "series"` data. Plus warnings
   (numRuns < 10, no `optimality` block, no `approach.alternatives`, a
   `client` data source with no `dataNote`, "quantum" in the title while
   `approach.chosen.kind` says otherwise).
3. **Security** (`--public` only) — scans every string field for things
   that look like a Taiwan national ID, phone number, email, street
   address, or an 8-digit business registration number, and every
   `points` figure for coordinates that fall inside Taiwan's real
   lat/lon range. **Findings never include the matched text itself** —
   only the JSON Pointer path and a category label, so a scan report is
   safe to paste into chat or a PR description. This layer produces
   warnings, not hard failures: it's a checklist prompt, not an
   auto-fixer. See Appendix F §5 for why automatic redaction isn't used.

### Custom terms

Drop a `.pii-terms` file (one term per line, e.g. client names or project
codenames) in the directory you run `validate.py` from, and `--public`
will flag any string field containing one of them, same as the built-in
patterns. No file present → this check is silently skipped.

## Adding a new figure type

`figures[].type` is not an enum on purpose. The website skips figure
entries whose `type` it doesn't recognize instead of erroring, so you can
put a new figure type in a `case.json` before the website has a renderer
for it. No schema change needed unless the new type has fields that must
be validated (in which case, add a conditional `if/then` block the same
way `image` is handled).

## Publishing a case (`visibility: public`)

1. `python python/validate.py case.json --public`
2. Work through every finding — each is a path + category, not the actual
   matched text, so open the file at that path to judge it yourself.
3. Fill out the checklist in Appendix F §5 and commit it alongside the
   case as `case.approval.json`.
4. Only then flip `meta.visibility` to `public`.
