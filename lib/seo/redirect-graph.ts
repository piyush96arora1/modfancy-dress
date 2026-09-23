export type Redirect = { source: string; destination: string; permanent?: boolean }

/**
 * Problems in a redirect set that waste crawl budget or make a live page
 * unreachable. Returns one message per problem; an empty list means clean.
 *
 * - a source that is a live URL: Next matches redirects before pages, so the
 *   live page can never be reached;
 * - a destination that is itself a source: a chain (extra hop) or a loop;
 * - a destination outside the live set: the chain ends in a 404;
 * - a destination of `/`: Google treats a redirect to the homepage as a soft 404;
 * - a source listed twice: only the first entry ever runs.
 *
 * Absolute (`http…`) destinations are not checked against the live set.
 */
export function validateRedirects(redirects: Redirect[], liveUrls: Set<string>): string[] {
  const problems: string[] = []
  const bySource = new Map<string, string>()
  for (const { source, destination } of redirects) {
    if (bySource.has(source)) problems.push(`duplicate source: ${source}`)
    else bySource.set(source, destination)
  }

  for (const { source, destination } of redirects) {
    if (liveUrls.has(source)) problems.push(`source is a live page (unreachable): ${source}`)
    if (destination === '/') problems.push(`destination is the homepage (soft 404): ${source}`)
    if (bySource.has(destination)) {
      const seen = new Set([source])
      let cur = destination
      while (bySource.has(cur) && !seen.has(cur)) {
        seen.add(cur)
        cur = bySource.get(cur)!
      }
      problems.push(seen.has(cur) ? `loop: ${source}` : `chain: ${source} -> ${destination} -> ...`)
    } else if (!destination.startsWith('http') && !liveUrls.has(destination)) {
      problems.push(`destination not live: ${source} -> ${destination}`)
    }
  }
  return problems
}

/**
 * Point every redirect straight at the end of its chain. Loops are left as
 * they are so validateRedirects still reports them.
 */
export function flattenRedirects<T extends Redirect>(redirects: T[]): T[] {
  const bySource = new Map(redirects.map((r) => [r.source, r.destination]))
  return redirects.map((r) => {
    const seen = new Set([r.source])
    let cur = r.destination
    while (bySource.has(cur) && !seen.has(cur)) {
      seen.add(cur)
      cur = bySource.get(cur)!
    }
    return seen.has(cur) ? r : { ...r, destination: cur }
  })
}
