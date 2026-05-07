import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import DashboardShell from "@/components/dashboard/DashboardShell"

export default async function DashboardPage() {
  const session = await requireAuth()

  const clinicId = session.user.clinicId
  const needsOnboarding = !clinicId

  if (needsOnboarding) {
    return (
      <DashboardShell
        needsOnboarding={true}
        clinicSlug={null}
        user={{
          name: session.user.name ?? "User",
          email: session.user.email ?? "",
          role: session.user.role ?? "STAFF",
          image: session.user.image ?? null,
        }}
      />
    )
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: {
      slug: true,
    },
  })

  if (!clinic) {
    return (
      <DashboardShell
        needsOnboarding={true}
        clinicSlug={null}
        user={{
          name: session.user.name ?? "User",
          email: session.user.email ?? "",
          role: session.user.role ?? "STAFF",
          image: session.user.image ?? null,
        }}
      />
    )
  }

  console.log("clinicId:", clinicId)
console.log("clinic:", clinic)

  redirect(`/${clinic.slug}/dashboard`)
}