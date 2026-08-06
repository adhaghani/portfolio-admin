"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const { login, loading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password.",
      )
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
