import "dotenv/config"

import { validateAppointmentCandidate } from "@/lib/domain/scheduling/validateAppointmentCandidate"
import { prisma } from "@/lib/prisma"
import { getSchedulingDomainContextByClinicAndDate } from "@/lib/data/scheduling/getSchedulingDomainContextByClinicAndDate"

const logResult = (label: string, result: unknown) => {
  console.log(`\n===== ${label} =====`)
  console.dir(result, { depth: null })
}

async function main() {
  const clinic = await prisma.clinic.findFirst({
    where: {
      slug: "smart-dental-demo-clinic",
    },
  })

  if (!clinic) {
    throw new Error("Clinic not found")
  }

  const context = await getSchedulingDomainContextByClinicAndDate(
    clinic.id,
    new Date("2026-04-21T00:00:00.000Z")
  )

  // ===== BASE ENTITIES =====

  const treatment = context.treatments.find(
    (item) => item.name === "Dental Cleaning"
  )

  const staff = context.staffMembers.find(
    (item) => item.fullName === "Dr. Valeria Herrera"
  )

  const clinicModule = context.modules.find(
    (item) => item.name === "Unit 1"
  )

  if (!treatment || !staff || !clinicModule) {
    throw new Error("Missing required domain entities for test case")
  }

  // ===== CASE 1 - VALID =====

  const result = validateAppointmentCandidate({
    treatment,
    staff,
    module: clinicModule,
    date: "2026-04-21",
    startTime: "11:00",
    appointments: context.appointments,
    inventoryItems: context.inventoryItems,
  })

  logResult("DB CASE 1 - VALID", result)

  // ===== CASE 2 - OVERLAP =====

  const overlapResult = validateAppointmentCandidate({
    treatment,
    staff,
    module: clinicModule,
    date: "2026-04-21",
    startTime: "09:00", // ya ocupado en seed
    appointments: context.appointments,
    inventoryItems: context.inventoryItems,
  })

  logResult("DB CASE 2 - OVERLAP", overlapResult)

  // ===== CASE 3 - INVENTORY WARNING =====

  const fillingTreatment = context.treatments.find(
    (item) => item.name === "Composite Filling"
  )

  const fillingModule = context.modules.find(
    (item) => item.name === "Unit 2"
  )

  if (!fillingTreatment || !fillingModule) {
    throw new Error("Missing data for inventory case")
  }

  const inventoryWarningResult = validateAppointmentCandidate({
    treatment: fillingTreatment,
    staff,
    module: fillingModule,
    date: "2026-04-21",
    startTime: "11:00",
    appointments: context.appointments,
    inventoryItems: context.inventoryItems,
  })

  logResult("DB CASE 3 - INVENTORY WARNING", inventoryWarningResult)

  // ===== CASE 4 - STAFF ABSENT =====

  const absentContext = await getSchedulingDomainContextByClinicAndDate(
    clinic.id,
    new Date("2026-04-23T00:00:00.000Z")
  )

  const absentStaff = absentContext.staffMembers.find(
    (item) => item.fullName === "Dr. Ricardo Ruiz"
  )

  const extractionTreatment = absentContext.treatments.find(
    (item) => item.name === "Tooth Extraction"
  )

  const moduleTwo = absentContext.modules.find(
    (item) => item.name === "Unit 2"
  )

  if (!absentStaff || !extractionTreatment || !moduleTwo) {
    throw new Error("Missing data for absence case")
  }

  const staffAbsentResult = validateAppointmentCandidate({
    treatment: extractionTreatment,
    staff: absentStaff,
    module: moduleTwo,
    date: "2026-04-23",
    startTime: "10:00",
    appointments: absentContext.appointments,
    inventoryItems: absentContext.inventoryItems,
  })

  logResult("DB CASE 4 - STAFF ABSENT", staffAbsentResult)
}



main()
  .catch((error) => {
    console.error("❌ DB scheduling test failed")
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })