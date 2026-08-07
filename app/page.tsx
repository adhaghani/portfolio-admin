"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getErrorMessage } from "@/lib/error-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const MAX_LOGIN_ATTEMPTS = 5

export default function LoginPage() {
  const { login, loading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000)
      setError(`Too many attempts. Please wait ${remaining}s.`)
      return
    }

    setSubmitting(true)
    try {
      await login(email, password)
      setAttempts(0)
    } catch (err) {
      const next = attempts + 1
      setAttempts(next)
      if (next >= MAX_LOGIN_ATTEMPTS) {
        const delay = Math.min(30_000, Math.pow(2, next - MAX_LOGIN_ATTEMPTS + 1) * 1000)
        setLockoutUntil(Date.now() + delay)
        setError(`Too many attempts. Please wait ${delay / 1000}s.`)
      } else {
        setError(getErrorMessage(err, "Invalid email or password."))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background">
      {/* Halftone background */}
      <div className="halftone-dots pointer-events-none absolute inset-0 text-muted-foreground/10" />

      <Card className="relative w-full max-w-sm border-border bg-card">
        <CardHeader className="space-y-1 pb-6">
          <div className="font-mono text-xl font-semibold tracking-tighter">
            adhaghani
          </div>
          <CardTitle className="heading-mono text-lg">Sign in</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="label-mono"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="input-mono"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="label-mono"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-mono"
              />
            </div>

            {error && (
              <p className="font-mono text-xs text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-foreground text-background hover:bg-foreground/90"
            >
              {submitting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="absolute bottom-6 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
        admin dashboard
      </p>
    </div>
  )
}
