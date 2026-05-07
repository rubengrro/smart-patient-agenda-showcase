"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/validations/authSchemas"
import { authClient } from "@/lib/auth-client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const LoginForm = () => {
  const router = useRouter()

  const [serverError, setServerError] = useState("")
  const [isDemoLoading, setIsDemoLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  })

  const onSubmit = async (data: LoginFormValues) => {
    setServerError("")

    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: true,
      callbackURL: "/dashboard",
    })

    if (error) {
      if (error.status === 403) {
        setServerError("Please verify your email before signing in.")
        return
      }

      setServerError(error.message ?? "Invalid email or password")
      return
    }
  }

  const handleDemoLogin = async () => {
    setServerError("")
    setIsDemoLoading(true)

    try {
      const response = await fetch("/api/demo/start", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)

        setServerError(data?.error ?? "Could not open demo account.")
        setIsDemoLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setServerError("Could not open demo account.")
      setIsDemoLoading(false)
    }
  }

  const isLoading = isSubmitting || isDemoLoading

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@clinic.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-500">{serverError}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isLoading}
        onClick={handleDemoLogin}
      >
        {isDemoLoading ? "Opening demo..." : "Use demo account"}
      </Button>
    </form>
  )
}

export default LoginForm