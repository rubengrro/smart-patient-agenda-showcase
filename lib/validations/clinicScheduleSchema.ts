import z from "zod"

const timeSchema = z 
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:mm.")

export const clinicScheduleDaySchema = z 
    .object({
        dayOfWeek: z.enum([
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
            "SUNDAY",
        ]),
        enabled: z.boolean(),
        startTime: timeSchema.optional(),
        endTime: timeSchema.optional(),
    })
    .superRefine((day, ctx) => {
        if(!day.enabled) return 

        if(!day.startTime) {
            ctx.addIssue({
                code: "custom",
                path: ["endTime"],
                message: "End time is required when the day is enabled.",
            })
        }

        if(day.startTime && day.endTime && day.startTime >= day.endTime) {
            ctx.addIssue({
                code: "custom",
                path: ["endTime"],
                message: "End time must be after start time.",
            })
        }
    })

    export const updateClinicScheduleSchema = z.object({
        days: z.array(clinicScheduleDaySchema).length(7),
    })

    export type UpdateClinicScheduleInput = z.infer<typeof updateClinicScheduleSchema>