import z from "zod";
import { StaffSpecialty } from "../generated/prisma/enums";

export const treatmentSchema = z.object({
    name: z 
        .string()
        .trim()
        .min(2, "Treatment name is required.")
        .max(80, "Treatment name is too long."),

    description: z 
        .string()
        .trim()
        .max(500, "Description is too long.")
        .optional()
        .or(z.literal("")),

    baseDurationMin: z.coerce
        .number()
        .int("Base duration must be a whole number.")
        .min(1, "Base duration cannot be negative.")
        .max(180, "Base duration cannot exceed 3 hours."),

    bufferMin: z.coerce
        .number()
        .int("Buffer must be a whole number.")
        .min(0, "Buffer cannot be a negative.")
        .max(180, "Buffer cannot exceed 3 hours."),
    
    requiredSpecialty: z
        .nativeEnum(StaffSpecialty)
        .optional()
        .nullable(),
    
    active: z.boolean().default(true),
})

export type TreatmentFormValues = z.input<typeof treatmentSchema>
export type TreatmentParsedValues = z.output<typeof treatmentSchema>