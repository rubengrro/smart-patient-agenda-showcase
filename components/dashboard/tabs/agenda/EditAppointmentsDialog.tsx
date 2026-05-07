"use client"

import { useMemo, useState, useTransition } from "react"
import useSWR, { mutate } from "swr"
import { toast } from "sonner"
import {
  CalendarClock,
  ClipboardPlus,
  FileText,
  MapPin,
  UserRound,
  UsersRound,
  Pencil
} from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  updateAppointmentSchema,
  type UpdateAppointmentInput,
} from "@/lib/validations/appointmentSchema"
import { AppointmentStatus } from "@/lib/generated/prisma/enums"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatAppointmentStatus } from "@/lib/utls/appointmentStatus"

interface PatientOption {
  id: string
  fullName: string
  active: boolean
}

interface TreatmentOption {
  id: string
  name: string
  active: boolean
}

interface StaffOption {
  id: string
  fullName: string
  active: boolean
}

interface ModuleOption {
  id: string
  name: string
  active: boolean
  status: "AVAILABLE" | "MAINTENANCE" | "OUT_OF_SERVICE"
}

interface PatientsResponse {
  patients: PatientOption[]
}

interface TreatmentsResponse {
  treatments: TreatmentOption[]
}

type StaffResponse = StaffOption[]

interface ModulesResponse {
  modules: ModuleOption[]
}

interface AppointmentForEdit {
  id: string
  date: string
  startTime: string
  notes?: string | null
  status: AppointmentStatus
  patient: { id: string; fullName: string }
  treatment: { id: string; name: string }
  staff: { id: string; fullName: string }
  module: { id: string; name: string }
}

interface EditAppointmentDialogProps {
  appointment: AppointmentForEdit
  selectedDate: string
}

const fetcher = async (url: string) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch data.")
  }

  return response.json()
}

export function EditAppointmentDialog({
  appointment,
  selectedDate,
}: EditAppointmentDialogProps) {
  const [isPending, startTransition] = useTransition()

const { data: patientsData } = useSWR<PatientsResponse>("/api/patients", fetcher)
const { data: treatmentsData } = useSWR<TreatmentsResponse>("/api/treatments", fetcher)
const { data: staffData } = useSWR<StaffResponse>("/api/staff", fetcher)
const { data: modulesData } = useSWR<ModulesResponse>("/api/modules", fetcher)

const patients = useMemo<PatientOption[]>(() => {
  return patientsData?.patients?.filter((patient) => patient.active) ?? []
}, [patientsData?.patients])

const treatments = useMemo<TreatmentOption[]>(() => {
  return treatmentsData?.treatments?.filter((treatment) => treatment.active) ?? []
}, [treatmentsData?.treatments])

const staff = useMemo<StaffOption[]>(() => {
  return staffData?.filter((member) => member.active) ?? []
}, [staffData])

const [open, setOpen] = useState(false)

const modules = useMemo<ModuleOption[]>(() => {
  return (
    modulesData?.modules?.filter(
      (clinicModule) =>
        clinicModule.active && clinicModule.status === "AVAILABLE"
    ) ?? []
  )
}, [modulesData?.modules])

  const form = useForm<UpdateAppointmentInput>({
    resolver: zodResolver(updateAppointmentSchema),
    defaultValues: {
      patientId: appointment.patient.id,
      treatmentId: appointment.treatment.id,
      staffId: appointment.staff.id,
      moduleId: appointment.module.id,
      date: selectedDate,
      startTime: appointment.startTime,
      notes: appointment.notes ?? "",
      status: appointment.status,
    },
  })

  const patientId = useWatch({ control: form.control, name: "patientId" })
  const treatmentId = useWatch({ control: form.control, name: "treatmentId" })
  const staffId = useWatch({ control: form.control, name: "staffId" })
  const moduleId = useWatch({ control: form.control, name: "moduleId" })
  const status = useWatch({ control: form.control, name: "status" })

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error ?? "Failed to update appointment.")

        if (data.validation?.errors?.length) {
          toast.error(data.validation.errors[0])
        }

        return
      }

      toast.success("Appointment updated.")

      await mutate(`/api/appointments?date=${selectedDate}`)

      setOpen(false)
    })
  })

  return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm">
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>
    </DialogTrigger>

    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
      <DialogHeader className="border-b px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border bg-muted/40 p-2">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <DialogTitle>Edit appointment</DialogTitle>
            <DialogDescription>
              Update appointment details. The scheduling engine will validate
              conflicts before saving.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-5 px-6 py-5">
        {/* Schedule section */}
        <section className="rounded-xl border bg-muted/20 p-4">
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Schedule</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...form.register("date")} />
            </div>

            <div className="space-y-2">
              <Label>Start time</Label>
              <Input type="time" {...form.register("startTime")} />
            </div>
          </div>
        </section>

        {/* Appointment details */}
        <section className="rounded-xl border bg-muted/20 p-4">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardPlus className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Appointment details</h3>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                Patient
              </Label>

              <Select
                value={patientId}
                onValueChange={(value) =>
                  form.setValue("patientId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>

                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Treatment</Label>

              <Select
                value={treatmentId}
                onValueChange={(value) =>
                  form.setValue("treatmentId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment" />
                </SelectTrigger>

                <SelectContent>
                  {treatments.map((treatment) => (
                    <SelectItem key={treatment.id} value={treatment.id}>
                      {treatment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Resources section */}
        <section className="rounded-xl border bg-muted/20 p-4">
          <div className="mb-4 flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Clinical resources</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Staff</Label>

              <Select
                value={staffId}
                onValueChange={(value) =>
                  form.setValue("staffId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>

                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Module
              </Label>

              <Select
                value={moduleId}
                onValueChange={(value) =>
                  form.setValue("moduleId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>

                <SelectContent>
                  {modules.map((clinicModule) => (
                    <SelectItem key={clinicModule.id} value={clinicModule.id}>
                      {clinicModule.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Status and notes */}
        <section className="rounded-xl border bg-muted/20 p-4">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Status and notes</h3>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Status</Label>

              <Select
                value={status}
                onValueChange={(value) =>
                  form.setValue("status", value as AppointmentStatus, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  {Object.values(AppointmentStatus).map(
                    (appointmentStatus) => (
                      <SelectItem
                        key={appointmentStatus}
                        value={appointmentStatus}
                      >
                        {formatAppointmentStatus(appointmentStatus)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Operational notes</Label>
              <Input
                placeholder="Short reminder or operational note"
                {...form.register("notes")}
              />
              <p className="text-xs text-muted-foreground">
                Keep this as a short operational reminder, not a clinical record.
              </p>
            </div>
          </div>
        </section>

        <div className="sticky bottom-0 -mx-6 flex justify-end gap-2 border-t bg-background/95 px-6 py-4 backdrop-blur">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving appointment..." : "Save appointment"}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
)
}