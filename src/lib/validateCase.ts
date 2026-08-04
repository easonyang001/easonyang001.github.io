import type { ValidateFunction } from "ajv/dist/2020.js";
import validateFn from "./generated/caseValidator.js";
import type { MramaCaseSchemaV1 } from "../types/case.ts";

const validate = validateFn as unknown as ValidateFunction;

/**
 * Validates a case at runtime using a validator pre-compiled from
 * contract/schema/case.v1.schema.json at build time (see
 * scripts/generate-case-validator.mjs). Compiling at runtime would require
 * `new Function`, which the site's CSP (script-src 'self', no unsafe-eval)
 * blocks.
 *
 * In dev, logs every error to the console with its JSON Pointer path. In
 * production, invalid cases are silently dropped by the caller rather than
 * crashing the page -- see loadCases().
 */
export function validateCase(data: unknown): data is MramaCaseSchemaV1 {
  const valid = validate(data);
  if (!valid && import.meta.env.DEV) {
    const slug = (data as { meta?: { slug?: string } })?.meta?.slug ?? "(unknown slug)";
    console.error(`[case] ${slug} failed schema validation:`);
    for (const err of validate.errors ?? []) {
      console.error(`  ${err.instancePath || "/"}  ${err.message}`);
    }
  }
  return valid;
}
