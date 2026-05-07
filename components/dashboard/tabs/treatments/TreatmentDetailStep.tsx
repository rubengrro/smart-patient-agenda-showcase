import type { ReactNode } from "react"

interface TreatmentDetailsStepProps {
  children: ReactNode
}

export function TreatmentDetailsStep({
  children,
}: TreatmentDetailsStepProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight">
          Treatment details
        </h3>

        <p className="text-sm text-muted-foreground">
          Configure scheduling duration, specialty and operational behavior.
        </p>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  )
}