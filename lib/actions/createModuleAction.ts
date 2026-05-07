
import { headers } from "next/headers";
import { auth } from "../auth";
import { UserRole } from "../generated/prisma/enums";
import { moduleSchema } from "../validations/moduleSchema";
import { createModule } from "../data/modules/createModule";
import { revalidatePath } from "next/cache";

export async function createModuleAction(values: unknown) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if(!session?.user) {
            return { success: false, message: "Unauthorized."}
        }

        if(!session.user.clinicId) {
            return { success: false, message: "User is not assigned to a clinic." }
        }

        if(session.user.role !== UserRole.ADMIN) {
            return { success: false, message: "Only admins can create modules." }
        }

        const parsedValues = moduleSchema.safeParse(values)

        if(!parsedValues.success) {
            return {
                success: false, message: parsedValues.error.issues[0]?.message ?? "Invalid module data."
            }
        }

        await createModule({
            clinicId: session.user.clinicId,
            values: parsedValues.data,
        })

        revalidatePath("/dashboard")

        return {
            success: true, message: "Module created successfully.",
        }
    } catch (error) {
        console.error("[CREATE_MODULE_ACTION_ERROR]", error)

        if (error instanceof Error) {
            return { success: false, message: error.message }
        }

        return {
            success: false, 
            message: "Unexptected error creating module."
        }
    }
}