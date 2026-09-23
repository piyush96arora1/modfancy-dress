/**
 * Date windows for homepage sections and banners, so the festival that's coming
 * up leads the homepage and last month's festival drops off on its own.
 *
 * Dates are `YYYY-MM-DD` in IST: the audience and the festival calendar are Indian.
 */

/** Today's date in India as YYYY-MM-DD. */
export function todayIST(now = new Date()): string {
  return new Date(now.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10)
}

/** Inclusive date window; a missing bound means open-ended. ISO dates compare lexically. */
export function isActiveOn(
  row: { starts_on?: string | null; ends_on?: string | null },
  today: string
): boolean {
  if (row.starts_on && today < row.starts_on) return false
  if (row.ends_on && today > row.ends_on) return false
  return true
}

/**
 * A section can require a minimum number of live products before it shows, so
 * a festival row (Halloween) waits until the stock is actually listed rather
 * than leading the homepage with two costumes.
 */
export function meetsMinProducts(row: { min_products?: number | null }, productCount: number): boolean {
  return !row.min_products || productCount >= row.min_products
}
