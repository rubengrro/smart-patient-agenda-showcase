export function isTerminalAppointmentStatus(status: string) {
  return ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(status)
}