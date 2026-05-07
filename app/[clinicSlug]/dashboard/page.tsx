import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import DashboardShell from "@/components/dashboard/DashboardShell"

interface DashboardTenantPageProps {
  params: Promise<{
    clinicSlug: string
  }>
}

export default async function DashboardTenantPage({
  params,
}: DashboardTenantPageProps) {
  const session = await requireAuth()
  const { clinicSlug } = await params

  const clinicId = session.user.clinicId

  if (!clinicId) {
    redirect("/dashboard")
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  if (!clinic) {
    redirect("/dashboard")
  }

  if (clinic.slug !== clinicSlug) {
    redirect(`/${clinic.slug}/dashboard`)
  }

  return (
    <DashboardShell
      needsOnboarding={false}
      clinicSlug={clinic.slug}
      user={{
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
        role: session.user.role ?? "STAFF",
        image: session.user.image ?? null,
      }}
    />
  )
}