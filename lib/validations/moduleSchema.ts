import { z } from "zod"
import { ModuleStatus } from "../generated/prisma/enums"


export const moduleSchema = z.object({
    name: z 
        .string()
        .min(2, "Module name must be at least 2 characters.")
        .max(100, "Module name is too long."),

    type: z
        .string()
        .min(2, "Module type must be at least 2 characters.")
        .max(100, "Module type is too long."),

    status: z.nativeEnum(ModuleStatus),

    active: z.boolean(),
})


export type ModuleFormValues = z.infer<typeof moduleSchema>