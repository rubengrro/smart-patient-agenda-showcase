"use client"

import { useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { mutate } from "swr"
import { toast } from "sonner"

import {
  moduleSchema,
  type ModuleFormValues,
} from "@/lib/validations/moduleSchema"
import { ModuleStatus } from "@/lib/generated/prisma/enums"

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

export interface EditableModule {
  id: string
  name: string
  type: string
  status: ModuleStatus
  active: boolean
}

interface EditModuleFormProps {
  module: EditableModule
  onSuccess?: () => void
}

const MODULE_TYPE_PRESETS = [
  "General",
  "Surgery",
  "Endodontics",
  "Orthodontics",
  "Pediatric",
  "Hygiene",
  "Imaging",
  "Emergency",
]

export function EditModuleForm({ module, onSuccess }: EditModuleFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: module.name,
      type: module.type,
      status: module.status,
      active: module.active,
    },
  })

  const status = useWatch({
    control: form.control,
    name: "status",
  })

  const selectedType = useWatch({
    control: form.control,
    name: "type",
  })

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const isActive = values.status === ModuleStatus.AVAILABLE

      const response = await fetch(`/api/modules/${module.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          active: isActive,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error ?? "Failed to update module.")
        return
      }

      toast.success("Module updated successfully.")

      await mutate("/api/modules")
      onSuccess?.()
    })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edit-module-name">Module name</Label>

          <Input
            id="edit-module-name"
            className="h-11 rounded-xl"
            placeholder="Unit 1"
            {...form.register("name")}
          />

          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>

          <Select
            value={status ?? ModuleStatus.AVAILABLE}
            onValueChange={(value) => {
              form.setValue("status", value as ModuleStatus, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Select module status" />
            </SelectTrigger>

            <SelectContent position="popper" className="z-60">
              {Object.values(ModuleStatus).map((moduleStatus) => (
                <SelectItem key={moduleStatus} value={moduleStatus}>
                  {formatEnumLabel(moduleStatus)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-xs text-muted-foreground">
            {status === ModuleStatus.AVAILABLE
              ? "Available for scheduling."
              : "Unavailable for new appointments."}
          </p>

          {form.formState.errors.status && (
            <p className="text-sm text-destructive">
              {form.formState.errors.status.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-module-type">Module type</Label>

        <Input
          id="edit-module-type"
          className="h-11 rounded-xl"
          placeholder="General, Surgery, Endodontics..."
          {...form.register("type")}
        />

        <div className="flex flex-wrap gap-2 rounded-xl border border-border/60 bg-muted/20 p-3">
          {MODULE_TYPE_PRESETS.map((preset) => {
            const isSelected = selectedType === preset

            return (
              <Button
                key={preset}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="h-7 rounded-full px-2.5 text-[11px]"
                onClick={() => {
                  form.setValue("type", preset, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
              >
                {preset}
              </Button>
            )
          })}
        </div>

        {form.formState.errors.type && (
          <p className="text-sm text-destructive">
            {form.formState.errors.type.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-xl"
      >
        {isPending ? "Saving changes..." : "Save changes"}
      </Button>
    </form>
  )
}