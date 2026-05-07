"use server"

import { auth } from "../auth"
import { headers } from "next/headers"
import { UserRole } from "../generated/prisma/enums"
import { treatmentSchema } from "../validations/treatmentSchema"
import { createTreatment } from "../data/treatments/createTreatment"
import { revalidatePath } from "next/cache"

interface CreateTreatmentActionState {
    success: boolean 
    message: string 
}

export async function createTreatmentAction(
    values: unknown
): Promise<CreateTreatmentActionState> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user) {
            return {
                success: false,
                message: "Unauthorized"
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
                message: "Only admins can create treatments"
            }
        }

        const parsedValues = treatmentSchema.safeParse(values)

        if (!parsedValues.success) {
            return {
                success: false,
                message: parsedValues.error.issues[0]?.message ?? "Invalid treatment data.",
            }
        }

        await createTreatment({
            clinicId: session.user.clinicId,
            values: parsedValues.data,
        })

        revalidatePath("/dashboard")

        return {
            success: true,
            message: "Treatment created successfully.",
        }
    } catch (error) {
        console.error("[CREATE_TREATMENT_ACTION_ERROR]", error)

        if (error instanceof Error) {
            return {
                success: false,
                message: error.message
            }
        }

        return {
            success: false,
            message: "Unexpected error creating treatment.",
        }
    }
}