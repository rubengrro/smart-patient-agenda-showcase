import { CheckIcon } from "lucide-react"
import { APPOINTMENT_STEPS, type AppointmentStepId } from "./appointmentSteps"

interface AppointmentStepperProps {
  currentStep: AppointmentStepId
}

export function AppointmentStepper({ currentStep }: AppointmentStepperProps) {
  const currentIndex = APPOINTMENT_STEPS.findIndex(
    (step) => step.id === currentStep
  )

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
      <div className="flex items-center gap-2">
        {APPOINTMENT_STEPS.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = index < currentIndex

          return (
            <div key={step.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {isCompleted ? <CheckIcon className="size-3.5" /> : index + 1}
              </div>

              <div className="min-w-0">
                <p
                  className={`truncate text-xs font-medium ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </p>
              </div>

              {index < APPOINTMENT_STEPS.length - 1 && (
                <div className="mx-2 h-px flex-1 bg-border/70" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}