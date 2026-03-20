/** Category listing pages that also show the static classical / folk dance comparison table. */
export const CLASSICAL_COSTUME_CATEGORY_SLUGS = ['bharatnatyam', 'kathak-dress'] as const

export function isClassicalCostumeCategorySlug(slug: string): boolean {
  return (CLASSICAL_COSTUME_CATEGORY_SLUGS as readonly string[]).includes(slug)
}
