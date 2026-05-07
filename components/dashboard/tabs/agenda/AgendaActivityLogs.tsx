"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import {
  Activity,
  CalendarClock,
  Package,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getAppointmentStatusClassName } from "@/lib/utls/appointmentStatus"

interface InventoryMovement {
  id: string
  quantity: number
  previousStock: number
  newStock: number
  notes: string | null
  createdAt: string
  inventoryItem: {
    id: string
    name: string
    unit: string
  }
}

interface AgendaActivityEvent {
  id: string
  type: "APPOINTMENT_STATUS_CHANGED"
  createdAt: string
  appointment: {
    id: string
    startTime: string
    endTime: string
    status: string
    notes: string | null
    patient: {
      id: string
      fullName: string
    }
    treatment: {
      id: string
      name: string
    }
    staff: {
      id: string
      fullName: string
    }
    module: {
      id: string
      name: string
    } | null
  }
  movements: InventoryMovement[]
}

interface AgendaActivityResponse {
  events: AgendaActivityEvent[]
}

interface AgendaActivityLogProps {
  selectedDate: string
}

const ITEMS_PER_PAGE = 5

const fetcher = async (url: string): Promise<AgendaActivityResponse> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to load agenda activity.")
  }

  return response.json()
}

function getActivityLabel(status: string) {
  if (status === "SCHEDULED") return "Appointment scheduled"
  if (status === "CONFIRMED") return "Appointment confirmed"
  if (status === "IN_PROGRESS") return "Appointment started"
  if (status === "COMPLETED") return "Appointment completed"
  if (status === "CANCELLED") return "Appointment cancelled"
  if (status === "NO_SHOW") return "No-show"

  return status.replaceAll("_", " ")
}
export function AgendaActivityLog({ selectedDate }: AgendaActivityLogProps) {
  const [page, setPage] = useState(1)

  const { data, error, isLoading } = useSWR<AgendaActivityResponse>(
    `/api/agenda/activity?date=${selectedDate}`,
    fetcher
  )

  const events = useMemo(() => {
    return data?.events ?? []
  }, [data?.events])

  const sortedEvents = useMemo(() => {
    return [...events].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [events])

  const totalPages = Math.max(
    1,
    Math.ceil(sortedEvents.length / ITEMS_PER_PAGE)
  )

  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE

    return sortedEvents.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedEvents, page])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          Agenda activity
        </CardTitle>

        <CardDescription>
          Operational events recorded for appointments on {selectedDate}.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading activity...</p>
        )}

        {error && (
          <p className="text-sm text-destructive">
            Could not load agenda activity.
          </p>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm font-medium">No activity recorded</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Status changes and completion records will appear here.
            </p>
          </div>
        )}

        {paginatedEvents.length > 0 && (
          <div className="space-y-3">
            {paginatedEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-start md:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getAppointmentStatusClassName(event.appointment.status)}
                    >
                      {getActivityLabel(event.appointment.status)}
                    </Badge>

                    <Badge variant="outline">
                      {event.appointment.startTime} -{" "}
                      {event.appointment.endTime}
                    </Badge>
                  </div>

                  <p className="flex items-center gap-2 text-sm font-medium">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    {event.appointment.treatment.name}
                  </p>

                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    {event.appointment.patient.fullName} ·{" "}
                    {event.appointment.staff.fullName}
                  </p>

                  {event.appointment.module && (
                    <p className="text-xs text-muted-foreground">
                      Module: {event.appointment.module.name}
                    </p>
                  )}

                  {event.movements.length > 0 && (
                    <div className="rounded-md bg-muted/40 p-3 text-sm">
                      <p className="flex items-center gap-2 font-medium">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        Inventory consumed
                      </p>

                      <div className="mt-2 space-y-1">
                        {event.movements.map((movement) => (
                          <div key={movement.id}>
                            <p className="text-muted-foreground">
                              {movement.inventoryItem.name}: -
                              {movement.quantity} {movement.inventoryItem.unit}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Stock: {movement.previousStock} →{" "}
                              {movement.newStock}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.appointment.notes && (
                    <p className="text-xs text-muted-foreground">
                      {event.appointment.notes}
                    </p>
                  )}
                </div>

                <div className="text-xs text-muted-foreground md:text-right">
                  {new Date(event.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>

                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}