import { z } from "zod"

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must use HH:mm format.")

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format.")

const createAppointmentStatusSchema = z.enum(["SCHEDULED", "CONFIRMED"])

export const appointmentCandidateSchema = z.object({
  patientId: z.string().min(1, "Patient is required."),
  treatmentId: z.string().min(1, "Treatment is required."),
  staffId: z.string().min(1, "Staff member is required."),
  moduleId: z.string().min(1, "Module is required."),
  date: isoDateSchema,
  startTime: timeSchema,

  notes: z
    .string()
    .trim()
    .max(280, "Notes must be less than 280 characters.")
    .optional()
    .or(z.literal("")),
})

export const createAppointmentSchema = appointmentCandidateSchema.extend({
  status: createAppointmentStatusSchema.default("SCHEDULED"),
})

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    "SCHEDULED",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
  ]),
})

export const updateAppointmentSchema = appointmentCandidateSchema.partial().extend({
  status: updateAppointmentStatusSchema.shape.status.optional(),
})

export type UpdateAppointmentInput = z.input<typeof updateAppointmentSchema>
export type UpdateAppointmentOutput = z.output<typeof updateAppointmentSchema>

export type AppointmentCandidateInput = z.input<typeof appointmentCandidateSchema>
export type AppointmentCandidateOutput = z.output<typeof appointmentCandidateSchema>

export type CreateAppointmentInput = z.input<typeof createAppointmentSchema>
export type CreateAppointmentOutput = z.output<typeof createAppointmentSchema>

export type UpdateAppointmentStatusInput = z.input<
  typeof updateAppointmentStatusSchema
>
export type UpdateAppointmentStatusOutput = z.output<
  typeof updateAppointmentStatusSchema
>