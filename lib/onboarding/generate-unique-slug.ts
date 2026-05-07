import { prisma } from "../prisma"

function slugifyClinicName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function generateUniqueClinicSlug(clinicName: string) {
    const baseSlug = slugifyClinicName(clinicName) || "clinic"

    const exactMatch = await prisma.clinic.findUnique({
        where: { slug: baseSlug },
        select: { id: true }
    })

    if (!exactMatch) return baseSlug

    let counter = 2

    while (true) {
        const candidate = `${baseSlug}-${counter}`

        const exists = await prisma.clinic.findUnique({
            where: { slug: candidate },
            select: { id: true }
        })

        if (!exists) return candidate

        counter++
    }
}