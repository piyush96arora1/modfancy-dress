import { NextResponse } from 'next/server'

const INDEXNOW_KEY = 'modfancydress-indexnow'
const SITE_URL = 'https://www.modfancydress.com'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

/**
 * POST /api/indexnow
 * Notifies Bing (and other IndexNow-compatible engines) of new or updated URLs.
 * Body: { urls: string[] }  — absolute URLs on modfancydress.com
 *
 * Usage after publishing new content:
 *   curl -X POST https://www.modfancydress.com/api/indexnow \
 *     -H "Content-Type: application/json" \
 *     -d '{"urls":["https://www.modfancydress.com/blog/new-post"]}'
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body || !Array.isArray(body.urls) || body.urls.length === 0) {
    return NextResponse.json({ error: 'Provide urls: string[] in request body' }, { status: 400 })
  }

  const urls: string[] = body.urls.filter(
    (u: unknown) => typeof u === 'string' && u.startsWith(SITE_URL)
  )

  if (urls.length === 0) {
    return NextResponse.json({ error: 'All URLs must start with ' + SITE_URL }, { status: 400 })
  }

  const payload = {
    host: 'www.modfancydress.com',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  }

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  })

  if (res.ok) {
    return NextResponse.json({ submitted: urls.length, urls })
  }

  const text = await res.text().catch(() => '')
  return NextResponse.json(
    { error: 'IndexNow API error', status: res.status, detail: text },
    { status: 502 }
  )
}
