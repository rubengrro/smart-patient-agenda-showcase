"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

type ClinicScheduleDay = {
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY"
  enabled: boolean
  startTime: string
  endTime: string
}

const WEEK_ORDER: ClinicScheduleDay["dayOfWeek"][] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]

type ClinicScheduleException = {
  id: string
  date: string
  isClosed: boolean
  reason?: string | null
}

const fetcher = async (url: string) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to load data")
  }

  return response.json()
}

const DAY_LABELS: Record<ClinicScheduleDay["dayOfWeek"], string> = {
  SUNDAY: "Sunday",
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
}

const toISODate = (date: Date) => {
  return date.toISOString().split("T")[0]
}

const getWeekStartSunday = (date: Date) => {
  const copy = new Date(date)
  const day = copy.getDay()

  copy.setDate(copy.getDate() - day)
  copy.setHours(0, 0, 0, 0)

  return copy
}

const addDays = (date: Date, days: number) => {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

const formatWeekRange = (start: Date, end: Date) => {
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
}

const ClinicScheduleSettings = () => {
  const [weekStart, setWeekStart] = useState(() => getWeekStartSunday(new Date()))
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])

  const { data, error, isLoading, mutate } = useSWR<{
    schedule: ClinicScheduleDay[]
  }>("/api/settings", fetcher)

  const exceptionsUrl = `/api/settings/exceptions?start=${toISODate(
    weekStart
  )}&end=${toISODate(weekEnd)}`

  const {
    data: exceptionsData,
    mutate: mutateExceptions,
  } = useSWR<{
    exceptions: ClinicScheduleException[]
  }>(exceptionsUrl, fetcher)

  const [editedDays, setEditedDays] = useState<ClinicScheduleDay[] | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [savingExceptionDate, setSavingExceptionDate] = useState<string | null>(
    null
  )

const days = useMemo(() => {
  const source = editedDays ?? data?.schedule ?? []
  
  return WEEK_ORDER.map((dayKey) =>
    source.find((d) => d.dayOfWeek === dayKey)
  ).filter(Boolean) as ClinicScheduleDay[]
}, [editedDays, data?.schedule])

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  }, [weekStart])

  const exceptionsByDate = useMemo(() => {
    return new Map(
      exceptionsData?.exceptions.map((exception) => [
        toISODate(new Date(exception.date)),
        exception,
      ]) ?? []
    )
  }, [exceptionsData?.exceptions])

  const updateDay = (
    dayOfWeek: ClinicScheduleDay["dayOfWeek"],
    updates: Partial<ClinicScheduleDay>
  ) => {
    setEditedDays((currentDays) => {
      const sourceDays = currentDays ?? data?.schedule ?? []

      return sourceDays.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day
      )
    })
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days }),
      })

      if (!response.ok) {
        throw new Error("Failed to save clinic schedule")
      }

      await mutate()
      setEditedDays(null)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleClosedDate = async (date: Date) => {
    const isoDate = toISODate(date)
    const existingException = exceptionsByDate.get(isoDate)
    const nextIsClosed = !existingException?.isClosed

    setSavingExceptionDate(isoDate)

    try {
      const response = await fetch("/api/settings/exceptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: isoDate,
          isClosed: nextIsClosed,
          reason: nextIsClosed ? "Closed from clinic settings" : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update clinic exception")
      }

      await mutateExceptions()
    } finally {
      setSavingExceptionDate(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clinic Schedule</CardTitle>
          <CardDescription>Loading schedule...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clinic Schedule</CardTitle>
          <CardDescription className="text-destructive">
            Could not load clinic schedule.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
  <Card>
    <CardHeader>
      <CardTitle>Clinic Schedule</CardTitle>
      <CardDescription>
        Configure weekly working hours and block specific dates when needed.
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-6">
      {/* Toolbar principal: mantiene navegación semanal sin sentirse como formulario */}
      <div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium">Selected week</p>
          <p className="text-sm text-muted-foreground">
            {formatWeekRange(weekStart, weekEnd)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart((current) => addDays(current, -7))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart(getWeekStartSunday(new Date()))}
          >
            Today
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart((current) => addDays(current, 7))}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
        {days.map((day) => {
          const dateForDay = weekDates.find(
            (date) =>
              date
                .toLocaleDateString("en-US", { weekday: "long" })
                .toUpperCase() === day.dayOfWeek
          )

          const isoDate = dateForDay ? toISODate(dateForDay) : null
          const exception = isoDate ? exceptionsByDate.get(isoDate) : null
          const isClosedByException = Boolean(exception?.isClosed)
          const isOpen = day.enabled && !isClosedByException

          const todayIso = toISODate(new Date())

          const isToday = isoDate === todayIso

          return (
            <div
              key={day.dayOfWeek}
              className={[
              "flex min-h-65 flex-col rounded-xl border bg-card p-4 shadow-sm transition-all duration-200",
              isToday &&
                "border-primary/60 ring-2 ring-primary/10 shadow-md shadow-primary/10",

              isClosedByException
                ? "border-destructive/40 bg-destructive/5"
                : isOpen
                  ? "border-border"
                  : "bg-muted/40",
            ].join(" ")}
            >
              {/* Day header */}
              <div className="relative mb-4 space-y-2">
                {isToday && (
                  <Badge
                    variant="default"
                    className="absolute right-0 top-0 h-5 px-2 text-[10px]"
                  >
                    Today
                  </Badge>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 pr-14">
                    <p
                      className={[
                        "truncate text-sm font-semibold",
                        isToday && "text-primary",
                      ].join(" ")}
                    >
                      {DAY_LABELS[day.dayOfWeek]}
                    </p>

                    <p
                      className={[
                        "text-xs text-muted-foreground",
                        isToday && "font-medium text-primary/80",
                      ].join(" ")}
                    >
                      {dateForDay?.toLocaleDateString()}
                    </p>
                  </div>

                  <Switch
                    checked={day.enabled}
                    onCheckedChange={(checked) =>
                      updateDay(day.dayOfWeek, { enabled: checked })
                    }
                    className="mt-7 shrink-0"
                  />
                </div>

                <Badge
                  variant={
                    isClosedByException ? "destructive" : isOpen ? "default" : "secondary"
                  }
                  className="w-fit"
                >
                  {isClosedByException ? "Exception closed" : isOpen ? "Open" : "Closed"}
                </Badge>
              </div>

              {/* Time block */}
              <div className="space-y-3 rounded-lg border bg-background/70 p-3">
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    Start time
                  </p>
                  <Input
                    type="time"
                    value={day.startTime}
                    disabled={!day.enabled || isClosedByException}
                    onChange={(event) =>
                      updateDay(day.dayOfWeek, {
                        startTime: event.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    End time
                  </p>
                  <Input
                    type="time"
                    value={day.endTime}
                    disabled={!day.enabled || isClosedByException}
                    onChange={(event) =>
                      updateDay(day.dayOfWeek, {
                        endTime: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Operational summary */}
              <div className="mt-4 flex-1">
                <p className="text-xs text-muted-foreground">
                  {isClosedByException
                    ? "This date is blocked only for the selected week."
                    : day.enabled
                      ? "Recurring weekly working day."
                      : "Clinic is closed every week on this day."}
                </p>
              </div>

              {/* Exception action */}
              <Button
                type="button"
                variant={isClosedByException ? "destructive" : "outline"}
                size="sm"
                className="mt-4 w-full"
                disabled={!isoDate || savingExceptionDate === isoDate}
                onClick={() => dateForDay && toggleClosedDate(dateForDay)}
              >
                {savingExceptionDate === isoDate
                  ? "Saving..."
                  : isClosedByException
                    ? "Unblock date"
                    : "Block date"}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Footer action */}
      <div className="flex justify-end border-t pt-4">
        <Button onClick={handleSave} disabled={isSaving || days.length !== 7}>
          {isSaving ? "Saving..." : "Save weekly schedule"}
        </Button>
      </div>
    </CardContent>
  </Card>
)
}

export default ClinicScheduleSettings