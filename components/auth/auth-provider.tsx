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

  React.useEffect(() => {
    const supabase = getBrowserClient()

    // Check initial session
    getSession().then((s) => {
      if (s) {
        setSession(s)
        setUser(s.user)
      }
      setLoading(false)
    })

    // Listen for auth state changes
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

  // Show nothing while checking session to avoid flash
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Not authenticated and on a dashboard page — redirect to login
  if (!session && pathname.startsWith("/dashboard")) {
    router.replace("/")
    return null
  }

  // Authenticated but on the login page — redirect to dashboard
  if (session && pathname === "/") {
    router.replace("/dashboard/blog")
    return null
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
