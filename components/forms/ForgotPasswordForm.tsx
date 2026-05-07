"use client"

import { useState, useTransition } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setMessage(null)
    setFormError(null)

    startTransition(async () => {
      try {
        const { error } = await authClient.requestPasswordReset({
          email, redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
          setFormError(error.message ?? "Could not request password reset.")
          return
        }
        setMessage("If the account exists, password reset instructions were sent.")
      } catch (error) {
        console.error("ForgotPasswordForm error:", error)
        setFormError("Something went wrong while requesting password reset.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className="rounded-md border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-600">
          {message}
        </div>
      )}

      {formError && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">
          {formError}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  )
}

export default ForgotPasswordForm