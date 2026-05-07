import { StaffMember, User } from "@/lib/generated/prisma/client"

export type StaffWithUser = StaffMember & {
  user: Pick<User, "email" | "role" | "active"> | null
}