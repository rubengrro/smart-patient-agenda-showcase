import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react"
import { AppointmentStatus } from "@/lib/generated/prisma/enums"
import type { UseFormReturn } from "react-hook-form"
import type { CreateAppointmentInput } from "@/lib/validations/appointmentSchema"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StaffOption {
  id: string
  fullName: string
  active: boolean
}

interface ModuleOption {
  id: string
  name: string
  active: boolean
  status: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  estimatedDurationMin: number
  calculatedEndTime: string
}

interface AppointmentAssignmentValidationStepProps {
  form: UseFormReturn<CreateAppointmentInput>
  status: string
  staffMembers: StaffOption[]
  modules: ModuleOption[]
  validationResult: ValidationResult | null
}

export function AppointmentAssignmentValidationStep({
  form,
  status,
  staffMembers,
  modules,
  validationResult,
}: AppointmentAssignmentValidationStepProps) {
  const staffId = form.watch("staffId")
  const moduleId = form.watch("moduleId")

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-medium tracking-tight">
          Assignment and validation
        </h3>
        <p className="text-sm text-muted-foreground">
          Assign staff and module. The system will validate conflicts,
          availability and inventory.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Staff</label>

          <Select
            value={staffId}
            onValueChange={(value) => {
              form.setValue("staffId", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }}
          >
            <SelectTrigger className="h-11 rounded-xl bg-background">
              <SelectValue placeholder="Select staff" />
            </SelectTrigger>

            <SelectContent position="popper" className="z-60">
              {staffMembers
                .filter((staff) => staff.active)
                .map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.fullName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Module</label>

          <Select
            value={moduleId}
            onValueChange={(value) => {
              form.setValue("moduleId", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }}
          >
            <SelectTrigger className="h-11 rounded-xl bg-background">
              <SelectValue placeholder="Select module" />
            </SelectTrigger>

            <SelectContent position="popper" className="z-60">
              {modules
                .filter((module) => module.active && module.status === "AVAILABLE")
                .map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>

        <Select
          value={status}
          onValueChange={(value) => {
            form.setValue(
              "status",
              value as "SCHEDULED" | "CONFIRMED",
              {
                shouldDirty: true,
                shouldValidate: true,
              }
            )
          }}
        >
          <SelectTrigger className="h-11 rounded-xl bg-background">
            <SelectValue placeholder="Select appointment status" />
          </SelectTrigger>

          <SelectContent position="popper" className="z-60">
            <SelectItem value={AppointmentStatus.SCHEDULED}>
              Scheduled
            </SelectItem>
            <SelectItem value={AppointmentStatus.CONFIRMED}>
              Confirmed
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
        {!validationResult ? (
          <div className="flex gap-3 text-sm text-muted-foreground">
            <Clock3 className="mt-0.5 size-4" />
            <p>
              Complete the required fields to preview appointment validation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {validationResult.isValid ? (
                <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
              ) : (
                <AlertCircle className="mt-0.5 size-4 text-destructive" />
              )}

              <div>
                <p className="text-sm font-medium">
                  {validationResult.isValid
                    ? "Appointment is valid"
                    : "Appointment has conflicts"}
                </p>

                <p className="text-sm text-muted-foreground">
                  Estimated duration: {validationResult.estimatedDurationMin} min ·
                  Ends at {validationResult.calculatedEndTime}
                </p>
              </div>
            </div>

            {validationResult.errors.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-destructive">
                {validationResult.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}

            {validationResult.warnings.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-amber-600 dark:text-amber-400">
                {validationResult.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  )
}