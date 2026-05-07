import { AppointmentStatus } from "@/lib/generated/prisma/enums"

export function formatAppointmentStatus(status: AppointmentStatus | string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function getAppointmentStatusClassName(status: AppointmentStatus | string) {
  switch (status) {
    case AppointmentStatus.SCHEDULED:
      return "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"

    case AppointmentStatus.CONFIRMED:
      return "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"

    case AppointmentStatus.IN_PROGRESS:
      return "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"

    case AppointmentStatus.COMPLETED:
      return "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"

    case AppointmentStatus.CANCELLED:
      return "border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"

    case AppointmentStatus.NO_SHOW:
      return "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300"

    default:
      return "border-border bg-muted text-muted-foreground"
  }
}