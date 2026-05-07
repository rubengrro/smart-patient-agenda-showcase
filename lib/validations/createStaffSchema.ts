import { z } from "zod"
import { StaffRole, StaffSpecialty, UserRole } from "../generated/prisma/enums"

const emptyStringToNull = (value: unknown) => {
  if (typeof value !== "string") return value
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

export const createStaffFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters long.")
      .max(120, "Full name must be 120 characters or fewer."),

    role: z.nativeEnum(StaffRole),

    specialty: z.nativeEnum(StaffSpecialty),

    customSpecialtyLabel: z
      .string()
      .trim()
      .max(80, "Custom specialty must be 80 characters or fewer."),

    active: z.boolean(),

    hasPlatformAccess: z.boolean(),

    email: z
      .string()
      .trim()
      .max(120, "Email must be 120 characters or fewer."),

    platformRole: z.nativeEnum(UserRole).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.specialty === StaffSpecialty.OTHER && data.customSpecialtyLabel.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customSpecialtyLabel"],
        message: "Custom specialty is required when specialty is OTHER.",
      })
    }

    if (data.specialty !== StaffSpecialty.OTHER && data.customSpecialtyLabel.trim().length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customSpecialtyLabel"],
        message: "Custom specialty must be empty unless specialty is OTHER.",
      })
    }

    if (data.hasPlatformAccess) {
      if (!data.email.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Email is required when platform access is enabled.",
        })
      } else if (!z.string().email().safeParse(data.email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Email must be a valid email address.",
        })
      }

      if (!data.platformRole) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["platformRole"],
          message: "Platform role is required when platform access is enabled.",
        })
      }
    }

    if (!data.hasPlatformAccess) {
      if (data.email.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Email must be empty when platform access is disabled.",
        })
      }

      if (data.platformRole) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["platformRole"],
          message: "Platform role must be empty when platform access is disabled.",
        })
      }
    }
  })

export const createStaffSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters long.")
      .max(120, "Full name must be 120 characters or fewer."),

    role: z.nativeEnum(StaffRole),

    specialty: z.nativeEnum(StaffSpecialty),

    customSpecialtyLabel: z.preprocess(
      emptyStringToNull,
      z
        .string()
        .trim()
        .min(2, "Custom specialty must be at least 2 characters long.")
        .max(80, "Custom specialty must be 80 characters or fewer.")
        .nullable()
        .optional()
    ),

    active: z.boolean(),

    hasPlatformAccess: z.boolean(),

    email: z.preprocess(
      emptyStringToNull,
      z
        .string()
        .trim()
        .email("Email must be a valid email address.")
        .max(120, "Email must be 120 characters or fewer.")
        .nullable()
        .optional()
    ),

    platformRole: z.preprocess(
      (value) => (value === "" ? null : value),
      z.nativeEnum(UserRole).nullable().optional()
    ),
  })
  .superRefine((data, ctx) => {
    if (data.specialty === StaffSpecialty.OTHER && !data.customSpecialtyLabel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customSpecialtyLabel"],
        message: "Custom specialty is required when specialty is OTHER.",
      })
    }

    if (data.specialty !== StaffSpecialty.OTHER && data.customSpecialtyLabel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customSpecialtyLabel"],
        message: "Custom specialty must be empty unless specialty is OTHER.",
      })
    }

    if (data.hasPlatformAccess) {
      if (!data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Email is required when platform access is enabled.",
        })
      }

      if (!data.platformRole) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["platformRole"],
          message: "Platform role is required when platform access is enabled.",
        })
      }
    }

    if (!data.hasPlatformAccess) {
      if (data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Email must be empty when platform access is disabled.",
        })
      }

      if (data.platformRole) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["platformRole"],
          message: "Platform role must be empty when platform access is disabled.",
        })
      }
    }
  })

export type CreateStaffFormValues = z.infer<typeof createStaffFormSchema>
export type CreateStaffInput = z.output<typeof createStaffSchema>