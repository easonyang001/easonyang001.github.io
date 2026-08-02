import type { MramaCaseSchemaV1 } from "../../types/case.ts";
import { validateCase } from "../../lib/validateCase.ts";

// Auto-discovers every case.json dropped in this directory -- no manual
// registration needed. A case that fails schema validation is dropped
// rather than crashing the site; see validateCase() for the dev-mode
// console reporting.
const modules = import.meta.glob<{ default: unknown }>("./*.json", { eager: true });

export const allCases: MramaCaseSchemaV1[] = Object.values(modules)
  .map((m) => m.default)
  .filter(validateCase);

/** Cases eligible for the public /solutions list and detail routes. */
export const publishedCases: MramaCaseSchemaV1[] = allCases.filter((c) => c.meta.status === "published");
