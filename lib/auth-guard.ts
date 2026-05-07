import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/log-in")
  }

  return {
    ...session,
    user: {
      id: session.user.id,
      name: session.user.name ?? "User",
      email: session.user.email ?? "",
      image: session.user.image ?? null,
      role: session.user.role ?? "STAFF",
      clinicId: session.user.clinicId ?? null,
    },
  }
}