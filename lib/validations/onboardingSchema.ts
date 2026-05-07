import z from "zod";

export const onboardingSchema = z.object({
    clinicName: z
        .string()
        .min(2, "Clinic name is required")
        .max(120, "Clinic name is too long"),

    clinicSlug: z
        .string()
        .min(2, "Clinic slug is required")
        .max(80, "Clinic slug is too long")
        .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),

    isAlsoStaff: z.boolean(),

    staffRole: z.enum(["ADMIN", "DENTIST", "ASSISTANT"]).optional(),

    staffSpecialty: z
        .enum(["GENERAL", "ORTHODONTICS", "SURGERY", "ENDODONTICS", "PERIODONTICS"])
        .optional(), 
    
    firstModuleName: z 
        .string()
        .min(2, "First module name is required")
        .max(100, "Module name is too long"),
    
    firstModuleType: z 
        .string()
        .max(100, "Module type is too long") 
        .optional(),
}).superRefine((data, ctx) => {
    if (data.isAlsoStaff && !data.staffRole) {
        ctx.addIssue({
            code: "custom",
            path: ["staffRole"],
            message: "Staff role is require,"
        })
    }

    if (
        data.isAlsoStaff && 
        data.staffRole === "DENTIST" &&
        !data.staffSpecialty
    ) {
        ctx.addIssue({
            code: "custom",
            path: ["staffSpecialty"],
            message: "Speciality is required for dentists"
        })
    }
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>

