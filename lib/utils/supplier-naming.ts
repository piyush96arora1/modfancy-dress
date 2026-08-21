/**
 * Name and slug derivation for supplier catalog rows.
 *
 * Every one of the 827 supplier products is named like "DES-mala rudraksh plain". The prefix
 * is the supplier's internal code, so it is stripped for display while the original is kept
 * on the row as `source_name`.
 */

/** "DES-mala rudraksh plain" -> "Mala Rudraksh Plain" */
export function cleanProductName(sourceName: string): string {
  const withoutPrefix = sourceName.replace(/^\s*DES-\s*/i, '')
  // "lehenga13" reads badly, so give a trailing digit group breathing room. Unit-ish
  // suffixes like "12no." are already space-separated upstream and stay untouched.
  const spaced = withoutPrefix.replace(/([a-z])(\d+)$/i, '$1 $2')
  return spaced
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}

/** URL-safe slug: lowercase, & becomes "and", runs of other characters collapse to one hyphen. */
export function slugifyCatalogName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Claims a unique slug for a product, suffixing collisions with a token from its own id.
 *
 * The supplier catalog contains genuine near-duplicates — "DES-mukut24" and "DES-mukut 24"
 * are separate products in the same category at the same price, and both normalise to
 * "mukut-24". The suffix is derived from the product's own source id rather than a running
 * counter, so a given product always resolves to the same slug and links shared with clients
 * never drift between imports.
 *
 * Mutates `taken` to record the slug it hands out.
 */
export function resolveCatalogSlug(
  baseSlug: string,
  sourceId: string,
  taken: Set<string>
): string {
  const idToken = sourceId.replace(/[^a-z0-9]/gi, '').slice(0, 6).toLowerCase()
  const candidate = taken.has(baseSlug) ? `${baseSlug}-${idToken}` : baseSlug

  // Pathological case: the suffixed form is also taken. Widen the token rather than
  // silently returning a duplicate.
  let final = candidate
  let width = 8
  while (taken.has(final) && width <= sourceId.length) {
    final = `${baseSlug}-${sourceId.replace(/[^a-z0-9]/gi, '').slice(0, width).toLowerCase()}`
    width += 2
  }
  if (taken.has(final)) {
    throw new Error(`Cannot resolve a unique slug for "${baseSlug}" (source ${sourceId})`)
  }

  taken.add(final)
  return final
}
