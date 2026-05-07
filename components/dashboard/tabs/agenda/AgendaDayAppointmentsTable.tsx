"use client"

import useSWR from "swr"
import {
  CalendarClock,
  Clock,
  DoorOpen,
  Stethoscope,
  UserRound,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AppointmentStatus } from "@/lib/generated/prisma/enums"
import { EditAppointmentStatusDialog } from "./EditAppointmentStatusDialog"
import { EditAppointmentDialog } from "./EditAppointmentsDialog"
import { ViewAppointmentSummaryDialog } from "./ViewappointmentSummaryDialog"
import { StartAppointmentButton } from "./StartAppointmentButton"
import { getAppointmentOperationalState } from "@/lib/domain/appointments/getAppointmentOperationalState"
import { formatAppointmentStatus, getAppointmentStatusClassName } from "@/lib/utls/appointmentStatus"
import { isTerminalAppointmentStatus } from "@/lib/utls/isTerminalAppointmentStatus"

type StatusFilter =
  | "all"
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"

type SortDirection = "asc" | "desc"

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  notes: string | null 
  estimatedDurationMin: number
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
  }
}

interface AppointmentsResponse {
  appointments: Appointment[]
}

interface AgendaDayAppointmentsTableProps {
  selectedDate: string
}

const fetcher = async (url: string): Promise<AppointmentsResponse> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch appointments.")
  }

  return response.json()
}

const AgendaDayAppointmentsTable = ({
  selectedDate,
}: AgendaDayAppointmentsTableProps) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [treatmentFilter, setTreatmentFilter] = useState("all")
  const [staffFilter, setStaffFilter] = useState("all")
  const [moduleFilter, setModuleFilter] = useState("all")

  const { data, error, isLoading } = useSWR<AppointmentsResponse>(
    `/api/appointments?date=${selectedDate}`,
    fetcher
  )

const rawAppointments = useMemo(() => {
  return data?.appointments ?? []
}, [data?.appointments])

const appointments = useMemo(() => {
  return rawAppointments
    .filter((appointment) => {
      if (statusFilter !== "all" && appointment.status !== statusFilter) {
        return false
      }

      if (
        treatmentFilter !== "all" &&
        appointment.treatment.id !== treatmentFilter
      ) {
        return false
      }

      if (staffFilter !== "all" && appointment.staff.id !== staffFilter) {
        return false
      }

      if (moduleFilter !== "all" && appointment.module.id !== moduleFilter) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      const result = a.startTime.localeCompare(b.startTime)
      return sortDirection === "asc" ? result : -result
    })
}, [
  rawAppointments,
  statusFilter,
  treatmentFilter,
  staffFilter,
  moduleFilter,
  sortDirection,
])

const treatmentOptions = useMemo(() => {
  return Array.from(
    new Map(
      rawAppointments.map((appointment) => [
        appointment.treatment.id,
        appointment.treatment,
      ])
    ).values()
  )
}, [rawAppointments])

const staffOptions = useMemo(() => {
  return Array.from(
    new Map(rawAppointments.map((a) => [a.staff.id, a.staff])).values()
  )
}, [rawAppointments])

const moduleOptions = useMemo(() => {
  return Array.from(
    new Map(rawAppointments.map((a) => [a.module.id, a.module])).values()
  )
}, [rawAppointments])



  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Day appointments</CardTitle>
          <CardDescription>Loading appointments...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Day appointments</CardTitle>
          <CardDescription className="text-destructive">
            Could not load appointments.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Day appointments</CardTitle>
        <CardDescription>
          {appointments.length === 0
            ? "No appointments scheduled for this day."
            : `Showing ${appointments.length} appointments for ${selectedDate}.`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
              <CalendarClock className="h-8 w-8 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">
                  No appointments scheduled
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Start by creating a new appointment to manage your clinic
                  schedule.
                </p>
              </div>
            </div>
          ) : (
            appointments.map((appointment) => {
              const isTerminal = isTerminalAppointmentStatus(appointment.status)

              const operationalState = getAppointmentOperationalState({
                status: appointment.status,
                date: selectedDate,
                startTime: appointment.startTime,
              })

              return (
              
              <Card
                key={appointment.id}
                className={[
                  "cursor-default transition-colors",
                  appointment.status === "COMPLETED" &&
                    "border-l-4 border-l-emerald-500 bg-emerald-500/4",
                  appointment.status === "CANCELLED" &&
                    "border-l-4 border-l-red-500 bg-red-500/4",
                  appointment.status === "NO_SHOW" &&
                    "border-l-4 border-l-zinc-500 bg-zinc-500/4",
                ].join(" ")}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="h-4 w-4" />
                        {appointment.startTime} - {appointment.endTime}
                      </CardTitle>

                      <CardDescription>
                        {appointment.patient.fullName}
                      </CardDescription>
                    </div>

                    {isTerminal ? (
                      <Badge
                        variant="outline"
                        className={getAppointmentStatusClassName(appointment.status)}
                      >
                        {formatAppointmentStatus(appointment.status)}
                      </Badge>
                    ) : (
                      <EditAppointmentStatusDialog
                        appointmentId={appointment.id}
                        treatmentId={appointment.treatment.id}
                        selectedDate={selectedDate}
                        currentStatus={appointment.status}
                      >
                        <button type="button">
                          <Badge
                            variant="outline"
                            className={[
                              "cursor-pointer",
                              getAppointmentStatusClassName(appointment.status),
                            ].join(" ")}
                          >
                            {formatAppointmentStatus(appointment.status)}
                          </Badge>
                        </button>
                      </EditAppointmentStatusDialog>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {appointment.estimatedDurationMin} min
                    </Badge>

                    <Badge variant="secondary">
                      {appointment.treatment.name}
                    </Badge>

                    <Badge variant="outline">
                      {appointment.staff.fullName}
                    </Badge>

                    <Badge variant="outline">
                      {appointment.module.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="border-t pt-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    {!isTerminal && (
                      <>
                        <EditAppointmentDialog
                          appointment={{
                            ...appointment,
                            date: selectedDate,
                            notes: appointment.notes ?? "",
                          }}
                          selectedDate={selectedDate}
                        />

                        {operationalState === "READY" && (
                          <StartAppointmentButton
                            appointmentId={appointment.id}
                            selectedDate={selectedDate}
                          />
                        )}
                      </>
                    )}

                    <ViewAppointmentSummaryDialog appointment={appointment} />
                  </div>
                </CardContent>
                </Card>
                  )
                })
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                {/* TIME SORT */}
                <TableHead>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-0 font-medium hover:bg-transparent"
                    onClick={() =>
                      setSortDirection((prev) =>
                        prev === "asc" ? "desc" : "asc"
                      )
                    }
                  >
                    Time
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </Button>
                </TableHead>

                <TableHead>Patient</TableHead>
                <TableHead>
              <Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
                <SelectTrigger className="h-8 w-45 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
                  <SelectValue placeholder="Treatment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All treatments</SelectItem>
                  {treatmentOptions.map((treatment) => (
                    <SelectItem key={treatment.id} value={treatment.id}>
                      {treatment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableHead>

            <TableHead>
              <Select value={staffFilter} onValueChange={setStaffFilter}>
                <SelectTrigger className="h-8 w-40 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
                  <SelectValue placeholder="Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All staff</SelectItem>
                  {staffOptions.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableHead>

            <TableHead>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="h-8 w-37.5 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modules</SelectItem>
                  {moduleOptions.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableHead>

                {/* STATUS FILTER */}
                <TableHead>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter(value as StatusFilter)
                    }
                  >
                    <SelectTrigger className="h-8 w-45 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableHead>

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                      <CalendarClock className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        No appointments scheduled
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Start by creating a new appointment to manage your clinic
                        schedule.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => {
                  const isTerminal = isTerminalAppointmentStatus(appointment.status)
                  const operationalState = getAppointmentOperationalState({
                    status: appointment.status,
                    date: selectedDate,
                    startTime: appointment.startTime,
                  })

                  return (
                    <TableRow
                        key={appointment.id}
                        className={[
                          "cursor-default transition-colors",

                          appointment.status === "COMPLETED" &&
                            "border-l-4 border-l-emerald-500 bg-emerald-500/4 hover:bg-emerald-500/6",

                          appointment.status === "CANCELLED" &&
                            "border-l-4 border-l-red-500 bg-red-500/4 hover:bg-red-500/6",

                          appointment.status === "NO_SHOW" &&
                            "border-l-4 border-l-zinc-500 bg-zinc-500/4 hover:bg-zinc-500/6",

                          !isTerminal && "hover:bg-muted/20",
                        ].join(" ")}
                      >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted/30">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <span>
                          {appointment.startTime} - {appointment.endTime}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        {appointment.patient.fullName}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        {appointment.treatment.name}
                      </div>
                    </TableCell>

                    <TableCell>{appointment.staff.fullName}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-muted-foreground" />
                        {appointment.module.name}
                      </div>
                    </TableCell>

                    <TableCell>
                      {isTerminal ? (
                        <Badge
                          variant="outline"
                          className={getAppointmentStatusClassName(appointment.status)}
                        >
                          {formatAppointmentStatus(appointment.status)}
                        </Badge>
                      ) : (
                        <EditAppointmentStatusDialog
                          appointmentId={appointment.id}
                          treatmentId={appointment.treatment.id}
                          selectedDate={selectedDate}
                          currentStatus={appointment.status}
                        >
                          <button type="button">
                            <Badge
                              variant="outline"
                              className={[
                                "cursor-pointer",
                                getAppointmentStatusClassName(appointment.status),
                              ].join(" ")}
                            >
                              {formatAppointmentStatus(appointment.status)}
                            </Badge>
                          </button>
                        </EditAppointmentStatusDialog>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!isTerminal && (
                          <>
                            {operationalState === "READY" && (
                              <StartAppointmentButton
                                appointmentId={appointment.id}
                                selectedDate={selectedDate}
                              />
                            )}

                            <EditAppointmentDialog
                              appointment={{
                                ...appointment,
                                date: selectedDate,
                                notes: appointment.notes ?? "",
                              }}
                              selectedDate={selectedDate}
                            />
                          </>
                        )}

                        <ViewAppointmentSummaryDialog appointment={appointment} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default AgendaDayAppointmentsTable