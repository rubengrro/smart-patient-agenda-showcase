"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
import useSWR, { mutate } from "swr"

import {
  updatePatientSchema,
  type UpdatePatientInput,
} from "@/lib/validations/patientSchema"

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

interface Patient {
  id: string
  fullName: string
  phone: string
  email: string | null
  dateOfBirth: string | null
  active: boolean
  preferredStaff: {
    id: string
    fullName: string
  } | null
}

interface EditPatientFormProps {
  patient: Patient
  onSuccess?: () => void
}

interface StaffOption {
  id: string
  fullName: string
  active: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const EditPatientForm = ({ patient, onSuccess }: EditPatientFormProps) => {
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { data: staffData } = useSWR("/api/staff", fetcher)
  const staffOptions: StaffOption[] = Array.isArray(staffData) ? staffData : []

  const form = useForm<UpdatePatientInput>({
    resolver: zodResolver(updatePatientSchema),
    defaultValues: {
      fullName: patient.fullName,
      phone: patient.phone,
      email: patient.email ?? "",
      dateOfBirth: patient.dateOfBirth ?? "",
      preferredStaffId: patient.preferredStaff?.id ?? "",
      active: patient.active,
    },
  })

  const preferredStaffId = useWatch({
    control: form.control,
    name: "preferredStaffId",
  })

  const activeValue = useWatch({
    control: form.control,
    name: "active",
  })

  const onSubmit = (values: UpdatePatientInput) => {
    setFormError(null)

    startTransition(async () => {
      try {
        const response = await fetch(`/api/patients/${patient.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })

        const data = await response.json()

        if (!response.ok) {
          setFormError(data.error ?? "Could not update patient.")
          return
        }

        await mutate("/api/patients")
        onSuccess?.()
      } catch (error) {
        console.error("EditPatientForm error:", error)
        setFormError("Something went wrong while updating the patient.")
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {formError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="edit-patient-full-name">Full name</Label>
        <Input
          id="edit-patient-full-name"
          className="h-11 rounded-xl"
          placeholder="Ana López"
          {...form.register("fullName")}
        />
        {form.formState.errors.fullName && (
          <p className="text-sm text-destructive">
            {form.formState.errors.fullName.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edit-patient-phone">Phone</Label>
          <Input
            id="edit-patient-phone"
            className="h-11 rounded-xl"
            placeholder="4441234567"
            {...form.register("phone")}
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-destructive">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-patient-email">Email</Label>
          <Input
            id="edit-patient-email"
            type="email"
            className="h-11 rounded-xl"
            placeholder="ana@example.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edit-patient-date-of-birth">Date of birth</Label>
          <Input
            id="edit-patient-date-of-birth"
            type="date"
            className="h-11 rounded-xl"
            {...form.register("dateOfBirth")}
          />
          {form.formState.errors.dateOfBirth && (
            <p className="text-sm text-destructive">
              {form.formState.errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Preferred staff</Label>

          <Select
            value={preferredStaffId || "none"}
            onValueChange={(value) => {
              form.setValue("preferredStaffId", value === "none" ? "" : value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="No preference" />
            </SelectTrigger>

            <SelectContent position="popper" className="z-60">
              <SelectItem value="none">No preference</SelectItem>

              {staffOptions
                .filter((staff) => staff.active)
                .map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.fullName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {form.formState.errors.preferredStaffId && (
            <p className="text-sm text-destructive">
              {form.formState.errors.preferredStaffId.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>

        <Select
          value={activeValue ? "active" : "inactive"}
          onValueChange={(value) => {
            form.setValue("active", value === "active", {
              shouldDirty: true,
              shouldValidate: true,
            })
          }}
        >
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>

          <SelectContent position="popper" className="z-60">
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isPending} className="h-11 w-full rounded-xl">
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  )
}

export default EditPatientForm