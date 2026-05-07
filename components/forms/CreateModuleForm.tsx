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

export function CreateModuleForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: "",
      type: "",
      status: ModuleStatus.AVAILABLE,
      active: true,
    },
  })

  const selectedStatus = useWatch({
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

      const res = await fetch("/api/modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          active: isActive,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Failed to create module.")
        return
      }

      toast.success("Module created")

      form.reset({
        name: "",
        type: "",
        status: ModuleStatus.AVAILABLE,
        active: true,
      })

      await mutate("/api/modules")
      onSuccess?.()
    })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5">

      <div className="space-y-1.5">
        <Label htmlFor="module-name">Module name</Label>
        <Input
          id="module-name"
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

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="module-type">Module type</Label>
          <span className="text-xs text-muted-foreground">
            Used for operational context
          </span>
        </div>

        <Input
          id="module-type"
          className="h-11 rounded-xl"
          placeholder="General, Surgery, Endodontics..."
          {...form.register("type")}
        />

        <div className="flex flex-wrap gap-2">
          {MODULE_TYPE_PRESETS.map((preset) => {
            const isSelected = selectedType === preset

            return (
              <Button
                key={preset}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="h-8 rounded-full px-3 text-xs"
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

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Status</Label>
          <span className="text-xs text-muted-foreground">
            Availability for scheduling
          </span>
        </div>

        <Select
          value={selectedStatus ?? ModuleStatus.AVAILABLE}
          onValueChange={(value) => {
            form.setValue("status", value as ModuleStatus, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }}
        >
          <SelectTrigger className="h-12 w-full rounded-xl border-border/70 bg-muted/20 px-4">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary" />
              <SelectValue placeholder="Select module status" />
            </div>
          </SelectTrigger>

          <SelectContent position="popper" className="z-60">
            {Object.values(ModuleStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {formatEnumLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {form.formState.errors.status && (
          <p className="text-sm text-destructive">
            {form.formState.errors.status.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-xl"
      >
        {isPending ? "Creating module..." : "Create module"}
      </Button>
    </form>
  )
}