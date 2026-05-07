import { prisma } from "../prisma"

interface ToggleClinicScheduleExceptionInput {
    clinicId: string 
    date: string
    isClosed: boolean 
    reason?: string
}

export async function toggleClinicScheduleException(
    input: ToggleClinicScheduleExceptionInput
) {
    const date = new Date(input.date)

    return prisma.clinicScheduleException.upsert({
        where: {
            clinicId_date: {
                clinicId: input.clinicId,
                date,
            },
        },
        update: {
            isClosed: input.isClosed,
            reason: input.reason
        },
        create: {
            clinicId: input.clinicId,
            date,
            isClosed: input.isClosed,
            reason: input.reason
        }
    })
}