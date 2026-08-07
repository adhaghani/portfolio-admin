"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { getBrowserClient } from "@/lib/supabase/client"
import { getErrorMessage } from "@/lib/error-utils"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { user } = useAuth()
  const [sending, setSending] = useState(false)

  async function handleResetPassword() {
    if (!user?.email) return
    setSending(true)
    try {
      const supabase = getBrowserClient()
      const { error } = await supabase.auth.resetPasswordForEmail(user.email)
      if (error) throw error
      toast.success("Password reset email sent")
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to send reset email"))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="heading-mono">Settings</h1>

      <div className="space-y-4 border border-border/50 bg-card p-6">
        <div>
          <span className="label-mono">Signed in as</span>
          <p className="mt-1 font-mono text-sm">{user?.email ?? "—"}</p>
        </div>

        <div className="border-t border-border/50 pt-4">
          <span className="label-mono">Password</span>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            A password reset link will be sent to your email address.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetPassword}
            disabled={sending}
            className="mt-3"
          >
            {sending ? "Sending..." : "Send password reset email"}
          </Button>
        </div>
      </div>
    </div>
  )
}
