"use client"

import { useRouter, usePathname } from "next/navigation"
import * as React from "react"
import { getBrowserClient } from "@/lib/supabase/client"
import { login as doLogin, logout as doLogout, getSession } from "@/lib/admin/auth"
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
  const isLocalhost = React.useRef(false)

  React.useEffect(() => {
    isLocalhost.current = window.location.hostname === "localhost"
    setMounted(true)

    if (isLocalhost.current) {
      setLoading(false)
      return
    }

    const supabase = getBrowserClient()

    getSession().then((s) => {
      if (s) {
        setSession(s)
        setUser(s.user)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (!s && pathname.startsWith("/dashboard")) {
        router.replace("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [router, pathname])

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

  const bypass = isLocalhost.current

  if (!bypass && !session && pathname.startsWith("/dashboard")) {
    router.replace("/")
    return null
  }

  if (!bypass && session && pathname === "/") {
    router.replace("/dashboard/blog")
    return null
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
