import { prisma } from "../prisma";

export async function getClininScheduleExceptions(
    clinicId: string,
    startDate: Date,
    endDate: Date,
) {
    return prisma.clinicScheduleException.findMany({
        where: {
            clinicId,
            date: {
                gte: startDate,
                lte: endDate
            }
        }
    })
}