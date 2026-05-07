import { createStaffWithOptionalUser } from "../data/staff/createStaffWithOptionalUser"
import { CreateStaffFormValues } from "../validations/createStaffSchema"

export async function createStaffAction(input: CreateStaffFormValues) {
  const result = await createStaffWithOptionalUser(input)
  return result
}