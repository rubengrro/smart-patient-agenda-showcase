"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DurationInputProps {
  id: string
  label: string
  valueInMinutes: number
  onChangeMinutes: (minutes: number) => void
  description?: string
  error?: string
}

function minutesToHHMM(minutes: number) {
  const safeMinutes = Number.isFinite(minutes) ? minutes : 0

  const hours = Math.floor(safeMinutes / 60)
  const remainingMinutes = safeMinutes % 60

  return `${String(hours).padStart(2, "0")}:${String(
    remainingMinutes
  ).padStart(2, "0")}`
}

function hhmmToMinutes(value: string) {
  const [hoursRaw, minutesRaw] = value.split(":")

  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw)

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return 0
  }

  return hours * 60 + minutes
}

export function DurationInput({
  id,
  label,
  valueInMinutes,
  onChangeMinutes,
  description,
  error,
}: DurationInputProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>

      <Input
        id={id}
        type="time"
        step={300}
        className="h-11 rounded-xl"
        value={minutesToHHMM(valueInMinutes)}
        onChange={(event) => {
          onChangeMinutes(hhmmToMinutes(event.target.value))
        }}
      />

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}