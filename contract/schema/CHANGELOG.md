# Schema changelog

## 1.0 — 2026-08-02

Initial schema. Six required top-level sections: `schemaVersion`, `meta`,
`problem`, `improvement`, `approach`, `reproduce`. Everything else optional.

Three fields are required specifically because the case loses its meaning
without them: `improvement.primary.baselineSource`,
`approach.chosen.rationale`, `reproduce.commit`.

`figures[].type` is intentionally not an enum — unrecognized types are
meant to pass validation and be skipped at render time, so new figure
types can be introduced without a schema bump.

A future breaking change should ship as `2.0` with the `1.0` rendering
path kept intact on the website side — published cases should never need
migration.
