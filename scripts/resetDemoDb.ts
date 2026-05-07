import "dotenv/config"
import { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.verification.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()

  await prisma.inventoryMovement.deleteMany()
  await prisma.appointment.deleteMany()

  await prisma.workingBlock.deleteMany()
  await prisma.workingDay.deleteMany()
  await prisma.staffAbsence.deleteMany()

  await prisma.treatmentInventoryRequirement.deleteMany()
  await prisma.moduleTreatmentSupport.deleteMany()
  await prisma.staffTreatmentAssignment.deleteMany()

  await prisma.inventoryItem.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.clinicModule.deleteMany()
  await prisma.treatment.deleteMany()
  await prisma.staffMember.deleteMany()

  await prisma.user.deleteMany()
  await prisma.clinic.deleteMany()

  console.log("✅ Demo database cleaned")
}

main()
  .catch((error) => {
    console.error("❌ Failed to clean demo database")
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })