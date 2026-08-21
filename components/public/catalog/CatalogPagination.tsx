import Link from 'next/link'

/** Page 1 is the bare URL so links shared with clients stay clean. */
export function CatalogPagination({
  page,
  total,
  pageSize,
  basePath,
}: {
  page: number
  total: number
  pageSize: number
  basePath: string
}) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null
  const href = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`)
  const cls =
    'px-4 py-2 rounded-lg border border-[#E8E5E0] bg-white text-sm text-[#2C2C2C] hover:border-[#C8956C] transition-colors'
  return (
    <nav className="flex items-center justify-center gap-3 mt-10" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cls} rel="prev">
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-[#9A9A9A]">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className={cls} rel="next">
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
