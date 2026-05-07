"use client"

import { useEffect, useState, useTransition } from "react"
import { useForm, useWatch, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { mutate } from "swr"
import { toast } from "sonner"

import {
  createStaffFormSchema,
  type CreateStaffFormValues,
} from "@/lib/validations/createStaffSchema"
import { StaffRole, StaffSpecialty } from "@/lib/generated/prisma/enums"

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
import { formatEnumLabel } from "@/lib/utls/formatters"

interface EditStaffFormProps {
  staffId: string
  initialValues: CreateStaffFormValues
  onSuccess?: () => void
}

export default function EditStaffForm({
  staffId,
  initialValues,
  onSuccess,
}: EditStaffFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateStaffFormValues>({
    resolver: zodResolver(createStaffFormSchema),
    defaultValues: {
      ...initialValues,
      role: StaffRole.DENTIST,
      active: initialValues.active,
      hasPlatformAccess: false,
      email: "",
      platformRole: undefined,
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form

  const specialty = useWatch({
    control: form.control,
    name: "specialty",
  })

  const showCustomSpecialty = specialty === StaffSpecialty.OTHER

  useEffect(() => {
    if (specialty !== StaffSpecialty.OTHER) {
      form.setValue("customSpecialtyLabel", "", { shouldValidate: true })
      form.clearErrors("customSpecialtyLabel")
    }
  }, [specialty, form])

  const onSubmit: SubmitHandler<CreateStaffFormValues> = (values) => {
    setServerError(null)

    startTransition(async () => {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          role: StaffRole.DENTIST,
          active: initialValues.active,
          hasPlatformAccess: false,
          email: "",
          platformRole: undefined,
          fullName: values.fullName.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setServerError(data.error ?? "Could not update staff member.")
        return
      }

      toast.success("Staff member updated.")
      await mutate("/api/staff")
      onSuccess?.()
    })
  }

  const handleInactivateStaff = () => {
    setServerError(null)

    startTransition(async () => {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: false,
          hasPlatformAccess: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error ?? "Could not inactivate staff member.")
        return
      }

      toast.success("Staff member inactivated.")
      await mutate("/api/staff")
      onSuccess?.()
    })
  }

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
          Update the provider profile used for treatment compatibility and
          scheduling.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-staff-full-name">Full name</Label>

        <div className="flex h-11 overflow-hidden rounded-xl border border-input bg-background">
          <div className="flex items-center border-r border-border/60 bg-muted/40 px-3 text-sm font-medium text-muted-foreground">
            Dr.
          </div>

          <Input
            id="edit-staff-full-name"
            className="h-full rounded-none border-0 focus-visible:ring-0"
            placeholder="Valeria Herrera"
            {...register("fullName")}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          The “Dr.” prefix is visual only. The stored name stays clean.
        </p>

        {errors.fullName?.message && (
          <p className="text-sm text-destructive">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Specialty</Label>
          <span className="text-xs text-muted-foreground">
            Scheduling compatibility
          </span>
        </div>

        <Select
          value={specialty ?? StaffSpecialty.GENERAL}
          onValueChange={(value) => {
            setValue("specialty", value as StaffSpecialty, {
              shouldDirty: true,
              shouldValidate: true,
            })

            if (value !== StaffSpecialty.OTHER) {
              setValue("customSpecialtyLabel", "", {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          }}
        >
          <SelectTrigger className="h-12 w-full rounded-xl border-border/70 bg-muted/20 px-4">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary" />
              <SelectValue placeholder="Select specialty" />
            </div>
          </SelectTrigger>

          <SelectContent position="popper" className="z-60">
            {Object.values(StaffSpecialty).map((specialtyOption) => (
              <SelectItem key={specialtyOption} value={specialtyOption}>
                {specialtyOption === StaffSpecialty.GENERAL
                  ? "General dentistry"
                  : formatEnumLabel(specialtyOption)}
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
        <div className="space-y-1.5">
          <Label htmlFor="edit-custom-specialty-label">
            Custom specialty
          </Label>

          <Input
            id="edit-custom-specialty-label"
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

      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="destructive"
          disabled={isPending || !initialValues.active}
          onClick={handleInactivateStaff}
          className="w-full sm:w-auto"
        >
          {initialValues.active ? "Inactivate staff" : "Already inactive"}
        </Button>

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-xl sm:w-auto"
        >
          {isPending ? "Saving changes..." : "Save changes"}
        </Button>
      </div>
    </form>
  )
}