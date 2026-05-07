export type AppointmentStepId = "details" | "assignment"

export const APPOINTMENT_STEPS: Array<{
  id: AppointmentStepId
  title: string
}> = [
  {
    id: "details",
    title: "Details",
  },
  {
    id: "assignment",
    title: "Validation",
  },
]