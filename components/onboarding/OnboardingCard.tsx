import { CalendarClock, CheckCircle2, ShieldCheck } from "lucide-react"
import OnboardingForm from "../forms/OnboardingForm"

interface OnboardingCardProps {
  open: boolean
  onClose: () => void
}

const OnboardingCard = ({ open, onClose }: OnboardingCardProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border bg-card shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/80 via-primary to-primary/40" />

        <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
          <aside className="hidden border-r bg-muted/40 p-6 md:block">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Smart Patient Agenda
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Set up your clinic workspace
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Configure the operational base required for scheduling,
                  staff availability, modules, and inventory-aware appointments.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 rounded-xl border bg-background/70 p-3">
                  <CalendarClock className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Clinic schedule</p>
                    <p className="text-xs text-muted-foreground">
                      Define working hours used by appointment validation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl border bg-background/70 p-3">
                  <ShieldCheck className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Tenant isolation</p>
                    <p className="text-xs text-muted-foreground">
                      Your workspace is linked to a clinic-specific route.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl border bg-background/70 p-3">
                  <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Ready for operations</p>
                    <p className="text-xs text-muted-foreground">
                      Unlock patients, treatments, staff, modules and agenda.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="p-6 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold tracking-tight">
                  Complete clinic setup
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  This creates your clinic workspace and prepares the dashboard
                  for operational scheduling.
                </p>
              </div>
            </div>

            <OnboardingForm onClose={onClose} />
          </section>
        </div>
      </div>
    </div>
  )
}

export default OnboardingCard