import { AppointmentStatus } from "@/lib/generated/prisma/enums"

interface Params {
  status: AppointmentStatus
  date: string 
  startTime: string 
}

export type AppointmentOperationalState =
  | "SCHEDULED"
  | "CONFIRMED"
  | "READY"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DELAYED"
  | "CANCELLED"
  | "NO_SHOW"

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}


export function getAppointmentOperationalState({
  status,
  date,
  startTime,
}: Params): AppointmentOperationalState {
  if (status === AppointmentStatus.COMPLETED) return "COMPLETED"
  if (status === AppointmentStatus.IN_PROGRESS) return "IN_PROGRESS"

  const now = new Date()

  const todayISO = now.toISOString().split("T")[0]

  if (date !== todayISO) {
    return status
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const startMinutes = timeToMinutes(startTime)

  if (nowMinutes >= startMinutes) {
    if (status === AppointmentStatus.CONFIRMED) {
      return "READY"
    }

    if (status === AppointmentStatus.SCHEDULED) {
      return "DELAYED"
    }
  }

  return status
}