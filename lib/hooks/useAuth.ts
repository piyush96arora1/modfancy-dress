'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

/**
 * True when the browser holds a Supabase auth cookie (`sb-<ref>-auth-token`, possibly
 * chunked as `.0`, `.1`). @supabase/ssr keeps the session only in these cookies, so
 * without one there is no user to load.
 */
function hasAuthCookie(): boolean {
  return /(?:^|;\s*)sb-[^=;]*-auth-token(?:\.\d+)?=/.test(document.cookie)
}

/**
 * Signed-in user for the public header.
 *
 * supabase-js is ~55 KB gzipped (~200 KB of JS to parse) and the header is on every public
 * page, so it is imported dynamically and only when an auth cookie exists. Shoppers are
 * almost never signed in: for them the library is never downloaded (Lighthouse, 4 Nov 2026:
 * it was the third-largest chunk on every page, ~80% unused).
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hasAuthCookie()) {
      setLoading(false)
      return
    }

    let cancelled = false
    let unsubscribe: (() => void) | undefined

    void import('@/lib/supabase/client').then(async ({ createClient }) => {
      if (cancelled) return
      const supabase = createClient()

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setIsAdmin(session?.user?.app_metadata?.role === 'admin')
        setLoading(false)
      })
      unsubscribe = () => subscription.unsubscribe()
      if (cancelled) unsubscribe()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (cancelled) return
      setUser(user)
      setIsAdmin(user?.app_metadata?.role === 'admin')
      setLoading(false)
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  return { user, isAdmin, loading }
}
