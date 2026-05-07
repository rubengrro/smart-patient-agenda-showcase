"use client"

import useSWR from "swr"
import { Eye, Stethoscope, UserRound, DoorOpen, Clock, Package, FileText, ReceiptText } from "lucide-react"

import { AppointmentStatus } from "@/lib/generated/prisma/enums"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatAppointmentStatus, getAppointmentStatusClassName } from "@/lib/utls/appointmentStatus"

interface AppointmentSummary {
  id: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  notes: string | null
  patient: { id: string; fullName: string }
  treatment: { id: string; name: string }
  staff: { id: string; fullName: string }
  module: { id: string; name: string }
}

interface InventoryMovement {
  id: string
  quantity: number
  previousStock: number
  newStock: number
  notes: string | null
  inventoryItem: {
    id: string
    name: string
    unit: string
  }
}

interface AppointmentMovementsResponse {
  movements: InventoryMovement[]
}

interface ViewAppointmentSummaryDialogProps {
  appointment: AppointmentSummary
}

const fetcher = async (url: string): Promise<AppointmentMovementsResponse> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to load appointment summary.")
  }

  return response.json()
}

export function ViewAppointmentSummaryDialog({
  appointment,
}: ViewAppointmentSummaryDialogProps) {
  const { data, isLoading, error } = useSWR<AppointmentMovementsResponse>(
    `/api/appointments/${appointment.id}/movements`,
    fetcher
  )

  const movements = data?.movements ?? []

  return (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm">
        <Eye className="mr-2 h-4 w-4" />
        View
      </Button>
    </DialogTrigger>

    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
      <DialogHeader className="border-b px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border bg-muted/40 p-2">
            <ReceiptText className="h-4 w-4 text-muted-foreground" />
          </div>

          <div>
            <DialogTitle>Appointment summary</DialogTitle>
            <DialogDescription>
              Operational record for this completed appointment.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 px-5 py-4">
        <section className="rounded-xl border bg-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Appointment details</p>
            <Badge
              variant="outline"
              className={getAppointmentStatusClassName(appointment.status)}
            >
              {formatAppointmentStatus(appointment.status)}
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.startTime} - {appointment.endTime}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.patient.fullName}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.treatment.name}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.staff.fullName}</span>
            </div>

            <div className="flex items-center gap-2 text-sm md:col-span-2">
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.module.name}</span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-muted/20 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Inventory consumed</p>
              <p className="text-xs text-muted-foreground">
                Items registered when the appointment was completed.
              </p>
            </div>
          </div>

          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Loading movements...
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive">
              Could not load inventory movements.
            </p>
          )}

          {!isLoading && !error && movements.length === 0 && (
            <div className="rounded-lg border border-dashed bg-background/60 p-3">
              <p className="text-sm font-medium">No inventory movements</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No inventory consumption was recorded for this appointment.
              </p>
            </div>
          )}

          {movements.length > 0 && (
            <div className="max-h-70 space-y-2 overflow-y-auto pr-1">
              {movements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-start justify-between gap-4 rounded-lg border bg-background/70 p-3"
                >
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {movement.inventoryItem.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Stock: {movement.previousStock} → {movement.newStock}
                    </p>

                    {movement.notes && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {movement.notes}
                      </p>
                    )}
                  </div>

                  <Badge variant="outline">
                    -{movement.quantity} {movement.inventoryItem.unit}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        {appointment.notes && (
          <section className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Operational note</p>
            </div>

            <p className="text-sm text-muted-foreground">
              {appointment.notes}
            </p>
          </section>
        )}
      </div>
    </DialogContent>
  </Dialog>
)
}