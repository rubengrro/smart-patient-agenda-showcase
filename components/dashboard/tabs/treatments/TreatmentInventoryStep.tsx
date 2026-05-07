import type { ReactNode } from "react"

interface TreatmentInventoryStepProps {
  children: ReactNode
}

export function TreatmentInventoryStep({
  children,
}: TreatmentInventoryStepProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight">
          Inventory requirements
        </h3>

        <p className="text-sm text-muted-foreground">
          Define which inventory items are required to perform this treatment.
        </p>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  )
}