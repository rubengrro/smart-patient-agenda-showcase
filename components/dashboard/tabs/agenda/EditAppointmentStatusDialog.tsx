"use client"

import { useState, useTransition } from "react"
import { mutate } from "swr"
import { toast } from "sonner"
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
import {
  Activity,
  Ban,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  PlayCircle,
  XCircle,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CompleteAppointmentPanel } from "./CompleteAppointmentPanel"
import { formatAppointmentStatus, getAppointmentStatusClassName } from "@/lib/utls/appointmentStatus"
import { Badge } from "@/components/ui/badge"

interface EditAppointmentStatusDialogProps {
  appointmentId: string
  selectedDate: string
  currentStatus: AppointmentStatus
  children?: React.ReactNode
  treatmentId: string
}

export function EditAppointmentStatusDialog({
  appointmentId,
  selectedDate,
  currentStatus,
  children,
  treatmentId,
}: EditAppointmentStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<AppointmentStatus>(currentStatus)
  const [isPending, startTransition] = useTransition()
  
  function getStatusMetadata(status: AppointmentStatus) {
  switch (status) {
    case AppointmentStatus.SCHEDULED:
      return {
        icon: CalendarClock,
        description:
          "The appointment is scheduled but has not been confirmed yet.",
      }

    case AppointmentStatus.CONFIRMED:
      return {
        icon: CheckCircle2,
        description:
          "The appointment is confirmed and can be started when ready.",
      }

    case AppointmentStatus.IN_PROGRESS:
      return {
        icon: PlayCircle,
        description:
          "The appointment is currently in progress and can be completed afterward.",
      }

    case AppointmentStatus.COMPLETED:
      return {
        icon: CheckCircle2,
        description:
          "Completing an appointment may register consumed inventory and operational logs.",
      }

    case AppointmentStatus.CANCELLED:
      return {
        icon: XCircle,
        description:
          "This appointment will remain in the record but will no longer be treated as active.",
      }

    case AppointmentStatus.NO_SHOW:
      return {
        icon: Ban,
        description:
          "The patient did not attend. The appointment will remain as a terminal operational record.",
      }

    default:
      return {
        icon: Clock3,
        description:
          "This change updates the appointment workflow without completing treatment execution.",
      }
  }
}
  const handleSave = () => {
  if (status === AppointmentStatus.COMPLETED) {
    return
  }


  startTransition(async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Update appointment status error:", data)
        toast.error(data.error ?? "Failed to update appointment.")
        return
      }

      toast.success("Appointment updated.")
      await mutate(`/api/appointments?date=${selectedDate}`)
      await mutate(`/api/appointments?date=${selectedDate}`)
      await mutate(`/api/agenda/activity?date=${selectedDate}`)
      setOpen(false)
    } catch (error) {
      console.error("handleSave error:", error)
      toast.error("Something went wrong while updating appointment.")
    }
  })
}

 return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      {children ?? (
        <Button variant="outline" size="sm">
          Edit
        </Button>
      )}
    </DialogTrigger>

    <DialogContent
      className={[
        "max-h-[90vh] overflow-y-auto overflow-x-hidden p-0",
        status === AppointmentStatus.COMPLETED
          ? "w-[95vw] max-w-3xl!"
          : "w-[95vw] max-w-lg!",
      ].join(" ")}
    >
      <DialogHeader className="border-b px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border bg-muted/40 p-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <DialogTitle>Update appointment status</DialogTitle>
            <DialogDescription>
              Manage the operational state of this appointment.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 px-6 pt-4 pb-5">
        <section className="rounded-xl border bg-muted/20 p-3">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Current workflow state</h3>
          </div>

          <div className="grid gap-3">
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as AppointmentStatus)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
              {Object.values(AppointmentStatus).map((appointmentStatus) => (
                <SelectItem key={appointmentStatus} value={appointmentStatus}>
                  {formatAppointmentStatus(appointmentStatus)}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>

            {(() => {
  const metadata = getStatusMetadata(status)
  const StatusIcon = metadata.icon

  return (
    <div
      className={[
        "rounded-lg border bg-background/70 p-3",
        getAppointmentStatusClassName(status),
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-background/70 p-1.5">
          <StatusIcon className="h-4 w-4" />
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">
              {formatAppointmentStatus(status)}
            </p>

            <Badge
              variant="outline"
              className={getAppointmentStatusClassName(status)}
            >
              {formatAppointmentStatus(status)}
            </Badge>
          </div>

          <p className="text-xs opacity-80">
            {metadata.description}
          </p>
        </div>
      </div>
    </div>
  )
})()}
          </div>
        </section>

        {status === AppointmentStatus.COMPLETED ? (
          <CompleteAppointmentPanel
            appointmentId={appointmentId}
            treatmentId={treatmentId}
            selectedDate={selectedDate}
            onCompleted={() => setOpen(false)}
          />
        ) : (
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  </Dialog>
)
}