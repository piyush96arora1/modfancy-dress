/** Approximate age & height for common size labels (India fancy dress). Unknown keys fall back in UI. */
const META: Record<string, { age: string; height: string }> = {
  '3-5': { age: '3 to 5 years', height: '95–110 cm' },
  '3-5 yrs': { age: '3 to 5 years', height: '95–110 cm' },
  '3-5 years': { age: '3 to 5 years', height: '95–110 cm' },
  '6-8': { age: '6 to 8 years', height: '110–125 cm' },
  '6-8 yrs': { age: '6 to 8 years', height: '110–125 cm' },
  '8-10': { age: '8 to 10 years', height: '125–135 cm' },
  '8-10 yrs': { age: '8 to 10 years', height: '125–135 cm' },
  '9-11': { age: '9 to 11 years', height: '128–140 cm' },
  '11-13': { age: '11 to 13 years', height: '135–150 cm' },
  '11-13 yrs': { age: '11 to 13 years', height: '135–150 cm' },
  'adult': { age: 'Adult', height: '150+ cm' },
  'adults': { age: 'Adult', height: '150+ cm' },
  'free size': { age: 'Varies', height: '—' },
  'one size': { age: 'Varies', height: '—' },
}

/** Sort order for known bands; unknown sizes sort last alphabetically. */
export const SIZE_SORT_ORDER: string[] = [
  '3-5',
  '3-5 yrs',
  '6-8',
  '6-8 yrs',
  '8-10',
  '8-10 yrs',
  '9-11',
  '11-13',
  '11-13 yrs',
  'adult',
  'free size',
]

export function normalizeSizeKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+years?\b/gi, ' yrs')
    .replace(/\s+/g, ' ')
}

export function lookupSizeMeta(sizeLabel: string): { age: string; height: string } {
  const key = normalizeSizeKey(sizeLabel)
  if (META[key]) return META[key]
  // Try without "yrs"
  const compact = key.replace(/\s*yrs\s*$/i, '').trim()
  if (META[compact]) return META[compact]
  return { age: '—', height: '—' }
}

export function sizeSortRank(label: string): number {
  const key = normalizeSizeKey(label)
  const i = SIZE_SORT_ORDER.findIndex((o) => key === o || key.startsWith(o))
  if (i >= 0) return i
  const j = SIZE_SORT_ORDER.indexOf(key.replace(/\s*yrs$/, '').trim())
  if (j >= 0) return j
  return 100 + key.charCodeAt(0)
}
