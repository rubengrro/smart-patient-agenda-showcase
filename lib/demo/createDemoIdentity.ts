import { randomUUID } from "crypto"
import { DEMO_EMAIL_DOMAIN } from "./constants"

export function createDemoIdentity() {
  const demoId = randomUUID().slice(0, 8)

  return {
    demoId,
    email: `demo+${demoId}@${DEMO_EMAIL_DOMAIN}`,
  }
}