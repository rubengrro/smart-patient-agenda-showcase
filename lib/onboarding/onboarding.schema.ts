import { z } from "zod"

export const onboardingSchema = z.object({
  clinicName: z
    .string()
    .trim()
    .min(2, "Clinic name must be at least 2 characters long.")
    .max(100, "Clinic name must be 100 characters or less."),

  firstModuleName: z
    .string()
    .trim()
    .min(2, "Module name must be at least 2 characters long.")
    .max(60, "Module name must be 60 characters or less."),

  firstModuleType: z
    .string()
    .trim()
    .max(60, "Module type must be 60 characters or less.")
    .optional()
    .or(z.literal("")),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>