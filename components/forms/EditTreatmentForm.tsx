"use client"

import { useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { updateTreatmentAction } from "@/lib/actions/updateTreatmentAction"
import {
  treatmentSchema,
  type TreatmentFormValues,
} from "@/lib/validations/treatmentSchema"
import { StaffSpecialty } from "@/lib/generated/prisma/enums"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mutate } from "swr"
import { DurationInput } from "./DurationInput"

const SPECIALTY_NONE_VALUE = "NONE"


export interface EditableTreatment {
  id: string
  name: string
  description: string | null
  baseDurationMin: number
  bufferMin: number
  requiredSpecialty: StaffSpecialty | null
  active: boolean
}

interface EditTreatmentFormProps {
  treatment: EditableTreatment
  onSuccess?: () => void
}

export function EditTreatmentForm({
  treatment,
  onSuccess,
}: EditTreatmentFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      name: treatment.name,
      description: treatment.description ?? "",
      baseDurationMin: treatment.baseDurationMin,
      bufferMin: treatment.bufferMin,
      requiredSpecialty: treatment.requiredSpecialty,
      active: treatment.active,
    },
  })

  const requiredSpecialty = useWatch({
    control: form.control,
    name: "requiredSpecialty",
  })

  const baseDurationMin = useWatch({
    control: form.control,
    name: "baseDurationMin",
  }) as number | undefined

  const bufferMin = useWatch({
    control: form.control,
    name: "bufferMin",
  }) as number | undefined

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateTreatmentAction({
        treatmentId: treatment.id,
        values,
      })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      await mutate("/api/treatments")
      onSuccess?.()
    })
  })

  const handleInactivateTreatment = () => {
    startTransition(async () => {
      const response = await fetch(`/api/treatments/${treatment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error ?? "Failed to inactivate treatment.")
        return
      }

      toast.success("Treatment inactivated.")
      await mutate("/api/treatments")
      onSuccess?.()
    })
  }

  return (
  <form onSubmit={onSubmit} className="space-y-5">
    <div className="space-y-2">
      <Label htmlFor="edit-treatment-name">Treatment name</Label>
      <Input
        id="edit-treatment-name"
        placeholder="Dental Cleaning"
        {...form.register("name")}
      />
      {form.formState.errors.name && (
        <p className="text-sm text-destructive">
          {form.formState.errors.name.message}
        </p>
      )}
    </div>

    <div className="space-y-2">
      <Label htmlFor="edit-treatment-description">Description</Label>
      <Textarea
        id="edit-treatment-description"
        placeholder="Routine prophylaxis and oral evaluation."
        {...form.register("description")}
      />
      {form.formState.errors.description && (
        <p className="text-sm text-destructive">
          {form.formState.errors.description.message}
        </p>
      )}
    </div>

    <div className="grid gap-4 md:grid-cols-2">
  <DurationInput
    id="edit-base-duration-min"
    label="Base duration"
    valueInMinutes={baseDurationMin ?? treatment.baseDurationMin}
    onChangeMinutes={(minutes) => {
      form.setValue("baseDurationMin", minutes, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }}
    description="Estimated procedure time."
    error={form.formState.errors.baseDurationMin?.message}
  />

  <DurationInput
    id="edit-buffer-min"
    label="Buffer"
    valueInMinutes={bufferMin ?? treatment.bufferMin}
    onChangeMinutes={(minutes) => {
      form.setValue("bufferMin", minutes, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }}
    description="Extra operational time between appointments."
    error={form.formState.errors.bufferMin?.message}
  />
</div>

    <div className="space-y-2">
      <Label>Required specialty</Label>
      <Select
        value={requiredSpecialty ?? SPECIALTY_NONE_VALUE}
        onValueChange={(value) => {
          form.setValue(
            "requiredSpecialty",
            value === SPECIALTY_NONE_VALUE ? null : (value as StaffSpecialty),
            {
              shouldValidate: true,
              shouldDirty: true,
            }
          )
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select required specialty" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={SPECIALTY_NONE_VALUE}>
            No specific specialty
          </SelectItem>

          {Object.values(StaffSpecialty).map((specialty) => (
            <SelectItem key={specialty} value={specialty}>
              {specialty}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
  <Button
    type="button"
    variant="destructive"
    disabled={isPending || !treatment.active}
    onClick={handleInactivateTreatment}
    className="w-full sm:w-auto"
  >
    {treatment.active ? "Inactivate treatment" : "Already inactive"}
  </Button>

  <Button
    type="submit"
    disabled={isPending}
    className="w-full sm:w-auto"
  >
    {isPending ? "Saving changes..." : "Save changes"}
  </Button>
</div>
  </form>
)}