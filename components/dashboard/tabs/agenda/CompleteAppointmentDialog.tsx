"use client"

import { useState } from "react"
import { CheckCircle2, ClipboardCheck, PackageCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CompleteAppointmentPanel } from "./CompleteAppointmentPanel"

interface CompleteAppointmentDialogProps {
  appointmentId: string
  treatmentId: string
  selectedDate: string
}

export function CompleteAppointmentDialog({
  appointmentId,
  treatmentId,
  selectedDate,
}: CompleteAppointmentDialogProps) {
  const [open, setOpen] = useState(false)

  return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button type="button" variant="outline" size="sm">
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Complete
      </Button>
    </DialogTrigger>

    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
      <DialogHeader className="border-b px-6 pt-5 pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border bg-muted/40 p-2">
            <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <DialogTitle>Complete appointment</DialogTitle>
            <DialogDescription>
              Review operational impact before marking this appointment as completed.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 px-6 pt-4 pb-5">
        <section className="rounded-xl border bg-muted/20 p-4">
          <div className="mb-3 flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Completion checklist</h3>
          </div>

          <p className="text-sm text-muted-foreground">
            Completing this appointment may register inventory consumption,
            update the appointment status, and create operational logs.
          </p>
        </section>

        <section className="rounded-xl border bg-muted/20 p-4">
          <CompleteAppointmentPanel
            appointmentId={appointmentId}
            treatmentId={treatmentId}
            selectedDate={selectedDate}
            onCompleted={() => setOpen(false)}
          />
        </section>
      </div>
    </DialogContent>
  </Dialog>
)
}