import { CalendarClock, UserRound } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { UseFormReturn } from "react-hook-form"
import type { CreateAppointmentInput } from "@/lib/validations/appointmentSchema"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Option {
  id: string
  active: boolean
}

interface PatientOption extends Option {
  fullName: string
}

interface TreatmentOption extends Option {
  name: string
}

interface AppointmentDetailsStepProps {
  form: UseFormReturn<CreateAppointmentInput>
  patients: PatientOption[]
  treatments: TreatmentOption[]
}

export function AppointmentDetailsStep({
  form,
  patients,
  treatments,
}: AppointmentDetailsStepProps) {
  const patientId = form.watch("patientId")
  const treatmentId = form.watch("treatmentId")

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarClock className="size-4" />
        </div>

        <div className="space-y-0.5">
          <h3 className="text-base font-semibold tracking-tight">
            Appointment details
          </h3>
          <p className="text-sm text-muted-foreground">
            Select the patient, treatment, date and start time.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Patient</Label>

          <Select
            value={patientId}
            onValueChange={(value) => {
              form.setValue("patientId", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }}
          >
            <SelectTrigger className="h-11 rounded-xl bg-background">
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>

            <SelectContent position="popper" className="z-60">
              {patients
                .filter((patient) => patient.active)
                .map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    <div className="flex items-center gap-2">
                      <UserRound className="size-3.5 text-muted-foreground" />
                      {patient.fullName}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Treatment</Label>

          <Select
            value={treatmentId}
            onValueChange={(value) => {
              form.setValue("treatmentId", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }}
          >
            <SelectTrigger className="h-11 rounded-xl bg-background">
              <SelectValue placeholder="Select treatment" />
            </SelectTrigger>

            <SelectContent position="popper" className="z-60">
              {treatments
                .filter((treatment) => treatment.active)
                .map((treatment) => (
                  <SelectItem key={treatment.id} value={treatment.id}>
                    {treatment.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Date</Label>
          <Input
            type="date"
            className="h-11 rounded-xl bg-background"
            {...form.register("date")}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Start time</Label>
          <Input
            type="time"
            className="h-11 rounded-xl bg-background"
            {...form.register("startTime")}
          />
        </div>
      </div>
    </section>
  )
}