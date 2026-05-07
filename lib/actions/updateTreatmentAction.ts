"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { auth } from "../auth"
import { UserRole } from "../generated/prisma/enums"
import { treatmentSchema } from "../validations/treatmentSchema"
import { updateTreatment } from "../data/treatments/updateTreatment"

interface UpdateTreatmentActionParams {
  treatmentId: string
  values: unknown
}

export async function updateTreatmentAction({
  treatmentId,
  values,
}: UpdateTreatmentActionParams) {
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
        message: "Only admins can update treatments.",
      }
    }

    if (!treatmentId) {
      return {
        success: false,
        message: "Treatment ID is required.",
      }
    }

    const parsedValues = treatmentSchema.safeParse(values)

    if (!parsedValues.success) {
      return {
        success: false,
        message:
          parsedValues.error.issues[0]?.message ?? "Invalid treatment data.",
      }
    }

    await updateTreatment({
      clinicId: session.user.clinicId,
      treatmentId,
      values: parsedValues.data,
    })

    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Treatment updated successfully.",
    }
  } catch (error) {
    console.error("[UPDATE_TREATMENT_ACTION_ERROR]", error)

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message: "Unexpected error updating treatment.",
    }
  }
}