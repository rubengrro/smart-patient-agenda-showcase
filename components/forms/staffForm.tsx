"use client"

import { useEffect, useState, useTransition } from "react"
import { SubmitHandler, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StaffRole, StaffSpecialty } from "@/lib/generated/prisma/enums"
import { createStaffFormSchema, CreateStaffFormValues } from "@/lib/validations/createStaffSchema"
import { createStaffAction } from "@/lib/actions/createStaffAction"
import { mutate } from "swr"
import { formatEnumLabel } from "@/lib/utls/formatters"

interface StaffFormProps {
  onSuccess?: () => void
}


export default function StaffForm({ onSuccess }: StaffFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

const form = useForm<CreateStaffFormValues>({
  resolver: zodResolver(createStaffFormSchema),
  defaultValues: {
    fullName: "",
    role: StaffRole.DENTIST,
    specialty: StaffSpecialty.GENERAL,
    customSpecialtyLabel: "",
    active: true,
    hasPlatformAccess: false,
    email: "",
    platformRole: undefined,
  },
})

  const specialty = useWatch({
    control: form.control,
    name: "specialty",
  })

  const showCustomSpecialty = specialty === StaffSpecialty.OTHER
  
  const hasPlatformAccess = useWatch({
    control: form.control,
    name: "hasPlatformAccess",
  })


  useEffect(() => {
    if (specialty !== StaffSpecialty.OTHER) {
      form.setValue("customSpecialtyLabel", "", { shouldValidate: true })
      form.clearErrors("customSpecialtyLabel")
    }
  }, [specialty, form])

  useEffect(() => {
    if (!hasPlatformAccess) {
      form.setValue("email", "", { shouldValidate: true })
      form.setValue("platformRole", undefined, { shouldValidate: true })
      form.clearErrors(["email", "platformRole"])
    }
  }, [hasPlatformAccess, form])

  const onSubmit: SubmitHandler<CreateStaffFormValues> = (values) => {
    setServerError(null)

    startTransition(async () => {
      const result = await createStaffAction(values)

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([fieldName, messages]) => {
            if (!messages?.length) return

            form.setError(fieldName as keyof CreateStaffFormValues, {
              type: "server",
              message: messages[0],
            })
          })
        }

        setServerError(result.error)
        return
      }

      form.reset({
        fullName: "",
        role: StaffRole.DENTIST,
        specialty: StaffSpecialty.GENERAL,
        customSpecialtyLabel: "",
        active: true,
        hasPlatformAccess: false,
        email: "",
        platformRole: undefined,
      })

      await mutate("/api/staff")

      onSuccess?.()
    })
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
    {serverError && (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        {serverError}
      </div>
    )}

    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <p className="text-sm font-medium">Operational dentist</p>
      <p className="mt-1 text-sm text-muted-foreground">
        This creates an active dentist available for scheduling.
      </p>
    </div>

    <div className="space-y-1.5">
      <Label htmlFor="fullName">Full name</Label>

      <div className="flex h-11 overflow-hidden rounded-xl border border-input bg-background">
        <div className="flex items-center border-r border-border/60 bg-muted/40 px-3 text-sm font-medium text-muted-foreground">
          Dr.
        </div>

        <Input
          id="fullName"
          className="h-full rounded-none border-0 focus-visible:ring-0"
          placeholder="Valeria Herrera"
          {...register("fullName")}
        />
      </div>

      {errors.fullName?.message && (
        <p className="text-sm text-destructive">
          {errors.fullName.message}
        </p>
      )}
    </div>

    <div className="space-y-1.5">
    <Label>Specialty</Label>
    <p className="text-xs text-muted-foreground">
      Used for treatment compatibility and scheduling validation.
    </p>

  <Select
    defaultValue={StaffSpecialty.GENERAL}
    onValueChange={(value) => {
      form.setValue("specialty", value as StaffSpecialty, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }}
  >
    <SelectTrigger className="h-12 w-full rounded-xl border-border/70 bg-muted/20 px-4">
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full bg-primary" />
        <SelectValue placeholder="Select specialty" />
      </div>
    </SelectTrigger>

    <SelectContent position="popper" className="z-60">
      {Object.values(StaffSpecialty).map((specialty) => (
        <SelectItem key={specialty} value={specialty}>
          {formatEnumLabel(specialty)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>


  {errors.specialty?.message && (
    <p className="text-sm text-destructive">
      {errors.specialty.message}
    </p>
  )}
</div>

{showCustomSpecialty && (
  <div className="space-y-2">
    <Label htmlFor="customSpecialtyLabel">Custom specialty</Label>

    <Input
      id="customSpecialtyLabel"
      className="h-11 rounded-xl"
      placeholder="e.g. Pediatric dentistry"
      {...register("customSpecialtyLabel")}
    />

    <p className="text-xs text-muted-foreground">
      Use this when the staff member has a specialty not listed above.
    </p>

    {errors.customSpecialtyLabel?.message && (
      <p className="text-sm text-destructive">
        {errors.customSpecialtyLabel.message}
      </p>
    )}
  </div>
)}

    <Button
      type="submit"
      disabled={isPending}
      className="h-11 w-full rounded-xl"
    >
      {isPending ? "Creating staff..." : "Create staff member"}
    </Button>
  </form>
)
}