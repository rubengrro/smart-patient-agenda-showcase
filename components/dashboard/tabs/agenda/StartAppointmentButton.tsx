"use client"

import { useTransition } from "react"
import { mutate } from "swr"
import { toast } from "sonner"
import { Play } from "lucide-react"

import { Button } from "@/components/ui/button"

interface Props {
  appointmentId: string
  selectedDate: string
}

export function StartAppointmentButton({
  appointmentId,
  selectedDate,
}: Props) {
  const [isPending, startTransition] = useTransition()

  const handleStart = () => {
    startTransition(async () => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "IN_PROGRESS",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error ?? "Failed to start appointment.")
        return
      }

      toast.success("Appointment started.")

      await mutate(`/api/appointments?date=${selectedDate}`)
    })
  }

  return (
    <Button
      size="sm"
      onClick={handleStart}
      disabled={isPending}
    >
      <Play className="mr-2 h-4 w-4" />
      {isPending ? "Starting..." : "Start"}
    </Button>
  )
}