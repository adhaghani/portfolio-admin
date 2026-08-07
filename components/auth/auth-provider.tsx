"use client"

import { useRouter, usePathname } from "next/navigation"
import * as React from "react"
import { getBrowserClient } from "@/lib/supabase/client"
import { login as doLogin, logout as doLogout } from "@/lib/admin/auth"
import { AuthContext } from "@/hooks/use-auth"
import type { Session, User } from "@supabase/supabase-js"
import { Loader2 } from "lucide-react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = React.useState<Session | null>(null)
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [mounted, setMounted] = React.useState(false)

  const devBypass =
    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true" &&
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"

  React.useEffect(() => {
    setMounted(true)

    if (devBypass) {
      setLoading(false)
      setUser({ id: "dev", email: "dev@localhost" } as unknown as User)
      return
    }

    const supabase = getBrowserClient()

    // Safety timeout: if onAuthStateChange doesn't fire within 10s,
    // the token refresh is likely stuck. Force-clear loading and sign
    // out so the redirect useEffect sends the user back to login.
    const safetyTimeout = setTimeout(() => {
      setLoading(false)
      supabase.auth.signOut().catch(() => {})
    }, 10_000)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      clearTimeout(safetyTimeout)

      if (event === "SIGNED_OUT") {
        // Session ended (expired, refresh failed, or manual logout).
        // Redirect is handled by the useEffect below.
        setSession(null)
        setUser(null)
        setLoading(false)
        return
      }

      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    return () => {
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [devBypass, router])

  // Redirects as side effects — NOT in the render body
  React.useEffect(() => {
    if (loading || devBypass) return

    if (!session && pathname.startsWith("/dashboard")) {
      router.replace("/")
    }

    if (session && pathname === "/") {
      router.replace("/dashboard/blog")
    }
  }, [loading, devBypass, session, pathname, router])

  const login = React.useCallback(
    async (email: string, password: string) => {
      const { data, error } = await doLogin(email, password)
      if (error) throw error
      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)
        router.replace("/dashboard/blog")
      }
    },
    [router],
  )

  const logout = React.useCallback(async () => {
    await doLogout()
    setSession(null)
    setUser(null)
    router.replace("/")
  }, [router])

  // Avoid hydration mismatch — render nothing until client-side mount
  if (!mounted) return null

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // If a redirect is pending, render nothing while the effect runs
  if (!devBypass && !session && pathname.startsWith("/dashboard")) return null
  if (!devBypass && session && pathname === "/") return null

  return (
    <AuthContext.Provider value={{ session, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
