import { authClient } from "@/lib/auth-client"

export type AppSession = typeof authClient.$Infer.Session
export type AppUser = AppSession["user"]
export type AppRole = AppUser["role"]