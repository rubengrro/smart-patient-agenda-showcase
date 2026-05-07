import { randomUUID } from "crypto"

export function createDemoSlug() {
  const demoId = randomUUID().slice(0, 8)

  return {
    demoId,
    slug: `demo-clinic-${demoId}`,
    email: `demo+${demoId}@smartpatientagenda.demo`,
  }
}