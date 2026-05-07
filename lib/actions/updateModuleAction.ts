// import { headers } from "next/headers"
// import { auth } from "../auth"
// import { UserRole } from "../generated/prisma/enums"
// import { moduleSchema } from "../validations/moduleSchema"
// import { updateModule } from "../data/modules/updateModule"
// import { revalidatePath } from "next/cache"

// interface UpdateModuleActionParams {
//     moduleId: string
//     values: unknown
// }

// export async function updateModuleAction({
//     moduleId,
//     values,
// }: UpdateModuleActionParams) {
//     try {
//         const session = await auth.api.getSession({
//             headers: await headers()
//         })

//         if(!session?.user) {
//             return { success: false, message: "Unauthorized." }
//         }

//         if(!session.user.clinicId) {
//             return { success: false, message: "User is not assigned to a clinic." }
//         }

//         if(session.user.role !== UserRole.ADMIN) {
//             return { success: false, message: "Only admins can update modules. "}
//         }

//         if(!moduleId) {
//             return { success: false, message: "Module ID is required. " }
//         }

//         const parsedValues = moduleSchema.safeParse(values)

//         if(!parsedValues.success) {
//             return {
//                 success: false, message: parsedValues.error.issues[0]?.message ?? "Invalid module data. "
//             }
//         }

//         await updateModule({
//             clinicId: session.user.clinicId,
//             moduleId,
//             values: parsedValues.data,
//         })

//         revalidatePath("/dashboard")

//         return {
//             success: true,
//             message: "Module updated successfully." 
//         }
//     } catch(error) {
//         console.error("[UPDATE_MODULE_ACTION_ERROR]", error)

//         if (error instanceof Error) {
//             return { sucecss: false, message: error.message }
//         }

//         return {
//             success: false, 
//             message: "Unexpected error updating module. "
//         }
//     }
// }