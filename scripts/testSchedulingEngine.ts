import { validateAppointmentCandidate } from "@/lib/domain/scheduling/validateAppointmentCandidate"
import { appointmentsMock } from "@/lib/mocks/appointments.mock"
import { inventoryMock } from "@/lib/mocks/inventory.mock"
import { modulesMock } from "@/lib/mocks/modules.mock"
import { staffMock } from "@/lib/mocks/staff.mock"
import { treatmentsMock } from "@/lib/mocks/treatments.mock"
import { getWeekDayFromISODate } from "@/lib/domain/scheduling/time"

console.log("2026-04-21 =>", getWeekDayFromISODate("2026-04-21"))
console.log("2026-04-23 =>", getWeekDayFromISODate("2026-04-23"))
console.log("staff_001 days =>", staffMock[0].schedule.workingDays.map(d => d.day))
console.log("module_001 days =>", modulesMock[0].schedule.workingDays.map(d => d.day))

const logResult = (label: string, result: unknown) => {
  console.log(`\n===== ${label} =====`)
  console.log(result)
}

const [year, month, day] = "2026-04-21".split("-").map(Number)
console.log({ year, month, day })
console.log(new Date(Date.UTC(year, month - 1, day)).toISOString())
console.log(new Date(Date.UTC(year, month - 1, day)).getUTCDay())

/**
 * CASE 1 - VALID
 * - treatment_001: Dental Cleaning
 * - staff_001 can perform it
 * - module_001 supports it
 * - Tuesday 2026-04-21 is a valid working day
 * - 11:00 should be free for both staff_001 and module_001
 * - inventory should be sufficient
 */
const caseValid = validateAppointmentCandidate({
  treatment: treatmentsMock[0],
  staff: staffMock[0],
  module: modulesMock[0],
  date: "2026-04-21",
  startTime: "11:00",
  appointments: appointmentsMock,
  inventoryItems: inventoryMock,
})

logResult("CASE 1 - VALID", caseValid)

/**
 * CASE 2 - STAFF INCOMPATIBLE
 * - treatment_003: Braces Adjustment
 * - staff_001 should NOT be allowed to perform it
 * - module_001 DOES support it
 * - 13:00 should avoid overlap noise
 */
const caseStaffError = validateAppointmentCandidate({
  treatment: treatmentsMock[2],
  staff: staffMock[0],
  module: modulesMock[0],
  date: "2026-04-21",
  startTime: "13:00",
  appointments: appointmentsMock,
  inventoryItems: inventoryMock,
})

logResult("CASE 2 - STAFF INCOMPATIBLE", caseStaffError)

/**
 * CASE 3 - OVERLAP
 * - same staff/module/date/time as an existing appointment
 * - should trigger overlap for both staff and module
 */
const caseOverlap = validateAppointmentCandidate({
  treatment: treatmentsMock[0],
  staff: staffMock[0],
  module: modulesMock[0],
  date: "2026-04-21",
  startTime: "09:00",
  appointments: appointmentsMock,
  inventoryItems: inventoryMock,
})

logResult("CASE 3 - OVERLAP", caseOverlap)

/**
 * CASE 4 - INVENTORY WARNING
 * - treatment_005: Composite Filling
 * - staff_001 can perform it
 * - module_002 supports it
 * - 11:00 should avoid overlap on module_002
 * - should produce low stock warning for Composite Resin Kit
 */
const caseInventoryWarning = validateAppointmentCandidate({
  treatment: treatmentsMock[4],
  staff: staffMock[0],
  module: modulesMock[1],
  date: "2026-04-21",
  startTime: "11:00",
  appointments: appointmentsMock,
  inventoryItems: inventoryMock,
})

logResult("CASE 4 - INVENTORY WARNING", caseInventoryWarning)

/**
 * CASE 5 - STAFF ABSENT
 * - staff_002 has absent date: 2026-04-23
 * - treatment_002 should be compatible with staff_002
 * - module_002 supports treatment_002
 * - Thursday is a normal working day for staff_002, so absence should be the key failure
 */
const caseStaffAbsent = validateAppointmentCandidate({
  treatment: treatmentsMock[1],
  staff: staffMock[1],
  module: modulesMock[1],
  date: "2026-04-23",
  startTime: "10:00",
  appointments: appointmentsMock,
  inventoryItems: inventoryMock,
})

logResult("CASE 5 - STAFF ABSENT", caseStaffAbsent)