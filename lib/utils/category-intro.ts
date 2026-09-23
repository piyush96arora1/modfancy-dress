const MAX = 320

/**
 * The short plain-text intro shown above a category's product grid: the first
 * non-heading paragraph of the (markdown) description, links and bold flattened.
 * The full description renders once, with formatting and links, in "About this
 * category" below the grid — above the grid it only pushed products off-screen.
 */
export function categoryIntro(description: string | null | undefined): string {
  const para = (description ?? '')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .find((b) => b && !b.startsWith('#') && !/^[-*] /.test(b))
  if (!para) return ''
  const plain = para
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  if (plain.length <= MAX) return plain
  const cut = plain.slice(0, MAX)
  const end = cut.lastIndexOf('. ')
  return end > 80 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…'
}
