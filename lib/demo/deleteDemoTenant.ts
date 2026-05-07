import { prisma } from "@/lib/prisma"
export async function deleteDemoTenant(clinicId: string) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: {
      id: true,
      isDemo: true,
    },
  })

  if (!clinic) return

  if (!clinic.isDemo) {
    throw new Error("Refusing to delete a non-demo clinic.")
  }
  await prisma.$transaction([
    prisma.inventoryMovement.deleteMany({
      where: { clinicId },
    }),

    prisma.appointment.deleteMany({
      where: { clinicId },
    }),

    prisma.clinicScheduleException.deleteMany({
      where: { clinicId },
    }),

    prisma.workingBlock.deleteMany({
      where: {
        workingDay: {
          OR: [
            { clinicId },
            { staff: { clinicId } },
            { module: { clinicId } },
          ],
        },
      },
    }),

    prisma.workingDay.deleteMany({
      where: {
        OR: [
          { clinicId },
          { staff: { clinicId } },
          { module: { clinicId } },
        ],
      },
    }),

    prisma.staffAbsence.deleteMany({
      where: {
        staff: { clinicId },
      },
    }),

    prisma.treatmentInventoryRequirement.deleteMany({
      where: {
        treatment: { clinicId },
      },
    }),

    prisma.moduleTreatmentSupport.deleteMany({
      where: {
        module: { clinicId },
      },
    }),

    prisma.staffTreatmentAssignment.deleteMany({
      where: {
        staff: { clinicId },
      },
    }),

    prisma.inventoryItem.deleteMany({
      where: { clinicId },
    }),

    prisma.patient.deleteMany({
      where: { clinicId },
    }),

    prisma.clinicModule.deleteMany({
      where: { clinicId },
    }),

    prisma.treatment.deleteMany({
      where: { clinicId },
    }),

    prisma.staffMember.deleteMany({
      where: { clinicId },
    }),

    prisma.user.deleteMany({
      where: { clinicId },
    }),

    prisma.clinic.delete({
      where: { id: clinicId },
    }),
  ])
}