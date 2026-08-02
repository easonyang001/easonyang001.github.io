import Ajv2020, { type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import schema from "../../contract/schema/case.v1.schema.json";
import type { MramaCaseSchemaV1 } from "../types/case.ts";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
let validateFn: ValidateFunction | null = null;

function getValidator(): ValidateFunction {
  if (!validateFn) {
    validateFn = ajv.compile(schema);
  }
  return validateFn;
}

/**
 * Validates a case at runtime. In dev, logs every error to the console with
 * its JSON Pointer path. In production, invalid cases are silently dropped
 * by the caller rather than crashing the page -- see loadCases().
 */
export function validateCase(data: unknown): data is MramaCaseSchemaV1 {
  const validate = getValidator();
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
