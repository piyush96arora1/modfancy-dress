// Pull-through image cache for Supabase Storage.
//
// img.modfancydress.com/<bucket>/<path>  ->  <supabase>/storage/v1/object/public/<bucket>/<path>
//
// The first request in a Cloudflare location fetches from Supabase; later ones are served
// from Cloudflare's cache, so Supabase "cached egress" (the thing keeping the org on Pro)
// only sees cache misses. Original uploads get unique timestamped names, so a long edge
// TTL is safe; w400/w800/w1600 variants can be regenerated in place, so browsers revalidate
// weekly rather than holding them for a year.

const ALLOWED_BUCKETS = new Set(['product-images'])
const EDGE_TTL = 60 * 60 * 24 * 30 // 30 days at Cloudflare
const BROWSER_TTL = 60 * 60 * 24 * 7 // 7 days in the browser

export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
    }

    const url = new URL(request.url)
    const path = url.pathname.replace(/^\/+/, '')
    const bucket = path.split('/', 1)[0]
    if (!ALLOWED_BUCKETS.has(bucket) || path.includes('..') || path === bucket) {
      return new Response('Not found', { status: 404 })
    }

    // Query strings never change the stored object; drop them so ?v=1 style busting
    // or tracking params cannot fragment the cache or be used to bypass it.
    const origin = `${env.SUPABASE_PUBLIC}/${path}`
    const upstream = await fetch(origin, {
      method: request.method,
      cf: {
        cacheEverything: true,
        cacheTtlByStatus: { '200-299': EDGE_TTL, '404': 60, '500-599': 0 },
      },
    })

    const headers = new Headers(upstream.headers)
    // Supabase sets its own cache/cookie/CORS headers; replace with ours.
    for (const h of ['set-cookie', 'cache-control', 'expires', 'pragma', 'age', 'x-served-by']) headers.delete(h)
    headers.set(
      'Cache-Control',
      upstream.ok ? `public, max-age=${BROWSER_TTL}, stale-while-revalidate=86400` : 'public, max-age=60'
    )
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('X-Content-Type-Options', 'nosniff')

    return new Response(upstream.body, { status: upstream.status, headers })
  },
}
