"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AgendaDayAppointmentsTable from "./agenda/AgendaDayAppointmentsTable"
import { CreateAppointmentDialog } from "./agenda/CreateAppointmentDialog"
import { AgendaActivityLog } from "./agenda/AgendaActivityLogs"

function getTodayISODate() {
  return new Date().toISOString().split("T")[0]
}

const AgendaTab = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayISODate())

  const isPastDate = useMemo(() => {
    const today = getTodayISODate()

    return selectedDate < today
  }, [selectedDate])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Agenda</h2>
          <p className="text-sm text-muted-foreground">
            View appointments by day and schedule new visits using the clinical validation engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setSelectedDate(getTodayISODate())}
          >
            Today
          </Button>

          <Input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="w-45"
          />

          <CreateAppointmentDialog
            selectedDate={selectedDate}
            disabled={isPastDate}
          />

        </div>
      </div>

      {isPastDate && (
        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          You are viewing a past date. Appointment creation is disabled, but historical appointments can still be reviewed.
        </div>
      )}

      <AgendaDayAppointmentsTable selectedDate={selectedDate} />

      <AgendaActivityLog selectedDate={selectedDate} />
    </div>
  )
}

export default AgendaTab