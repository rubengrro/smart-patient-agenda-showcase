import { z } from "zod"

const patientBaseSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Patient name must be at least 2 characters.")
    .max(100, "Patient name must be less than 100 characters."),

  phone: z
    .string()
    .trim()
    .min(7, "Phone must be at least 7 characters.")
    .max(20, "Phone must be less than 20 characters."),

  email: z
    .string()
    .trim()
    .email("Invalid email address.")
    .optional()
    .or(z.literal("")),

  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal("")),

  preferredStaffId: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  active: z.boolean().default(true),

  notes: z
    .string()
    .trim()
    .max(280, "Reminder must be less than 280 characters.")
    .optional()
    .or(z.literal("")),
})

export const createPatientSchema = patientBaseSchema

export const updatePatientSchema = patientBaseSchema.partial()

export type CreatePatientInput = z.input<typeof createPatientSchema>
export type CreatePatientOutput = z.output<typeof createPatientSchema>

export type UpdatePatientInput = z.input<typeof updatePatientSchema>
export type UpdatePatientOutput = z.output<typeof updatePatientSchema>