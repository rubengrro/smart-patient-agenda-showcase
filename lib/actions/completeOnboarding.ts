"use server"

import { revalidatePath } from "next/cache"
import { UserRole, ModuleStatus } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { onboardingSchema, type OnboardingInput } from "@/lib/onboarding/onboarding.schema"
import { generateUniqueClinicSlug } from "../onboarding/generate-unique-slug"
import { getServerSession } from "../session"

type CompleteOnboardingResult =
  | { success: true; clinicSlug: string }
  | { success: false; error: string }

export async function completeOnboarding(
  rawInput: OnboardingInput
): Promise<CompleteOnboardingResult> {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be signed in to complete onboarding.",
      }
    }

    const parsed = onboardingSchema.safeParse(rawInput)

    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid onboarding data.",
      }
    }

    const input = parsed.data

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        clinicId: true,
        role: true,
        name: true,
        isDemo: true,
      },
    })

    if (!currentUser) {
      return {
        success: false,
        error: "User not found.",
      }
    }

    if (currentUser.clinicId) {
      return {
        success: false,
        error: "Onboarding has already been completed for this account.",
      }
    }

    const slug = await generateUniqueClinicSlug(input.clinicName)

    const isDemoUser = currentUser.isDemo === true

    await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          name: input.clinicName,
          slug,
          isDemo: isDemoUser,
          demoExpiresAt: isDemoUser
            ? new Date(Date.now() + 2 * 60 * 60 * 1000)
            : null,

          onboardingCompleted: true,
        },
        select: {
          id: true,
        },
      })

      await tx.user.update({
        where: { id: currentUser.id },
        data: {
          clinicId: clinic.id,
          role: UserRole.ADMIN,
        },
      })

      await tx.clinicModule.create({
        data: {
          clinicId: clinic.id,
          name: input.firstModuleName,
          type: input.firstModuleType || "General",
          status: ModuleStatus.AVAILABLE,
          active: true,
        },
      })
    })

    revalidatePath("/dashboard")

    return { success: true, clinicSlug: slug }
  } catch (error) {
    console.error("completeOnboarding error:", error)

    return {
      success: false,
      error: "Something went wrong while completing onboarding.",
    }
  }
}