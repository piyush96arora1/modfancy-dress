/**
 * Products for a blog post's "Shop this guide" grid: round-robin across the
 * post's categories (so a Navratri guide shows dandiya *and* garba, not eight
 * of whichever is listed first), each category in its own order, no repeats.
 */
export function interleaveGuideProducts<T extends { id: string }>(lists: T[][], limit = 8): T[] {
  const out: T[] = []
  const seen = new Set<string>()
  const cursors = lists.map(() => 0)
  let progressed = true
  while (out.length < limit && progressed) {
    progressed = false
    for (let i = 0; i < lists.length && out.length < limit; i++) {
      while (cursors[i] < lists[i].length) {
        const item = lists[i][cursors[i]++]
        if (seen.has(item.id)) continue
        seen.add(item.id)
        out.push(item)
        progressed = true
        break
      }
    }
  }
  return out
}
