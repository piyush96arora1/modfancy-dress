/** SERP-snippet limits enforced on every copy script before it writes. */
export const TITLE_MAX = 60
export const META_MIN = 70
export const META_MAX = 160
const DEVANAGARI = /[ऀ-ॿ]/

export function checkCopy({ seoTitle, metaDescription }: { seoTitle: string; metaDescription: string }): string[] {
  const v: string[] = []
  if (!seoTitle || seoTitle.length > TITLE_MAX) v.push(`seo_title length ${seoTitle?.length ?? 0} (max ${TITLE_MAX})`)
  if (!metaDescription || metaDescription.length < META_MIN || metaDescription.length > META_MAX)
    v.push(`meta_description length ${metaDescription?.length ?? 0} (${META_MIN}-${META_MAX})`)
  if (DEVANAGARI.test(seoTitle) || DEVANAGARI.test(metaDescription)) v.push('title/meta must be English (Roman script)')
  return v
}
