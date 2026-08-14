import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle middleware case
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle middleware case
          }
        },
      },
    }
  )
}

/**
 * Cached per-request. React's `cache()` deduplicates calls with identical
 * arguments (here, none) made during the same server render pass — so no
 * matter how many layouts/pages call getUser(), Supabase's auth server is
 * only actually hit ONCE per request instead of 2-3 times.
 *
 * NOTE: this only dedupes within a single request. The middleware call is
 * a separate request/response cycle and can't be merged with this — that's
 * addressed in the next step.
 */
export const getUser = cache(async () => {
  const supabase = createClient()
  return supabase.auth.getUser()
})