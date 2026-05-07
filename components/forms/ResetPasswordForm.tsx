"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const ResetPasswordForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!token) {
      setFormError("Invalid or missing reset token.")
      return
    }

    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.")
      return
    }

    startTransition(async () => {
      try {
        const { error } = await authClient.resetPassword({
          newPassword,
          token,
        })

        if (error) {
          setFormError(error.message ?? "Could not reset password.")
          return
        }
        router.push("/log-in")
      } catch (error) {
        console.error("ResetPasswordForm error:", error)
        setFormError("Something went wrong while resetting your password.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">
          {formError}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium">New password</label>
        <Input
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Confirm password</label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
      </div>

      <Button type="submit" disabled={isPending || !token} className="w-full">
        {isPending ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  )
}

export default ResetPasswordForm