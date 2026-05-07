"use client"

import { createTreatmentAction } from "@/lib/actions/createTreatmentAction"
import {
  TreatmentFormValues,
  treatmentSchema,
} from "@/lib/validations/treatmentSchema"
import { StaffSpecialty } from "@/lib/generated/prisma/enums"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { mutate } from "swr"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Textarea } from "../ui/textarea"
import { DurationInput } from "./DurationInput"
import { formatEnumLabel } from "@/lib/utls/formatters"

interface CreateTreatmentFormProps {
  onSuccess?: () => void
}

const SPECIALTY_NONE_VALUE = "NONE"

export function CreateTreatmentForm({ onSuccess }: CreateTreatmentFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      name: "",
      description: "",
      baseDurationMin: 30,
      bufferMin: 10,
      requiredSpecialty: null,
      active: true,
    },
  })

  const requiredSpecialty = useWatch({
    control: form.control,
    name: "requiredSpecialty",
  })

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await createTreatmentAction(values)

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      form.reset()
      await mutate("/api/treatments")
      onSuccess?.()
    })
  })

const baseDurationMin =
  useWatch({
    control: form.control,
    name: "baseDurationMin",
  }) ?? 30

const bufferMin =
  useWatch({
    control: form.control,
    name: "bufferMin",
  }) ?? 10

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="treatment-name">Treatment name</Label>
        <Input
          id="treatment-name"
          className="h-11 rounded-xl"
          placeholder="Dental Cleaning"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="treatment-description">Description</Label>
        <Textarea
          id="treatment-description"
          className="min-h-24 rounded-xl"
          placeholder="Routine prophylaxis and oral evaluation."
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
  <DurationInput
    id="base-duration-min"
    label="Base duration"
    valueInMinutes={Number(baseDurationMin)}
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
    id="buffer-min"
    label="Buffer"
    valueInMinutes={Number(bufferMin)}
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

      <div className="space-y-1.5">
        <Label>Required specialty</Label>
          <Select
            value={requiredSpecialty ?? SPECIALTY_NONE_VALUE}
            onValueChange={(value) => {
              form.setValue(
                "requiredSpecialty",
                value === SPECIALTY_NONE_VALUE
                  ? null
                  : (value as StaffSpecialty),
                {
                  shouldValidate: true,
                  shouldDirty: true,
                }
              )
            }}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Select required specialty" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              className="z-60"
            >
              <SelectItem value={SPECIALTY_NONE_VALUE}>
                No specific specialty
              </SelectItem>

              {Object.values(StaffSpecialty).map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {formatEnumLabel(specialty)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        <p className="text-xs text-muted-foreground">
          Used to filter compatible staff when scheduling.
        </p>

        {form.formState.errors.requiredSpecialty && (
          <p className="text-sm text-destructive">
            {form.formState.errors.requiredSpecialty.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-xl"
      >
        {isPending ? "Creating treatment..." : "Create treatment"}
      </Button>
    </form>
  )
}