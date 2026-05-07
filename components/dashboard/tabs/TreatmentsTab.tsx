import { CreateTreatmentDialog } from "./treatments/CreateTreatmentDialog"
import TreatmentList from "./treatments/TreatmentList"

export default function TreatmentsTab() {
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Treatments</h1>
          <p className="text-sm text-muted-foreground">
            Configure clinical procedures, duration rules and operational buffers.
          </p>
        </div>

        <CreateTreatmentDialog />
      </div>

      <TreatmentList />
    </section>
  )
}