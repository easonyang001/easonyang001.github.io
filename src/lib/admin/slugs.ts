/** Normalizes free typing into the ^[a-z0-9-]+$ shape the backend requires. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function nextAvailableSlug(value: string, existingValues: Iterable<unknown>): string {
  const base = slugify(value);
  if (!base) return "";

  const existing = new Set(
    Array.from(existingValues, (item) => (typeof item === "string" ? item.toLowerCase() : ""))
  );
  if (!existing.has(base)) return base;

  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
