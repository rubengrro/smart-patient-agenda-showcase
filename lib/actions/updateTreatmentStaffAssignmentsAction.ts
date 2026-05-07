"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { auth } from "../auth"
import { UserRole } from "../generated/prisma/enums"
import { updateTreatmentStaffAssignments } from "../data/treatments/updateTreatmentStaffAssignments"

interface UpdateTreatmentStaffAssignmentsActionParams {
  treatmentId: string
  staffIds: string[]
}

export async function updateTreatmentStaffAssignmentsAction({
  treatmentId,
  staffIds,
}: UpdateTreatmentStaffAssignmentsActionParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return {
        success: false,
        message: "Unauthorized.",
      }
    }

    if (!session.user.clinicId) {
      return {
        success: false,
        message: "User is not assigned to a clinic.",
      }
    }

    if (session.user.role !== UserRole.ADMIN) {
      return {
        success: false,
        message: "Only admins can assign staff to treatments.",
      }
    }

    await updateTreatmentStaffAssignments({
      clinicId: session.user.clinicId,
      treatmentId,
      staffIds,
    })

    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Staff assignments updated successfully.",
    }
  } catch (error) {
    console.error("[UPDATE_TREATMENT_STAFF_ASSIGNMENTS_ACTION_ERROR]", error)

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: "Unexpected error updating staff assignments.",
    }
  }
}