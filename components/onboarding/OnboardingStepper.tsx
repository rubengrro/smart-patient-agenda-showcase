import { CheckIcon } from "lucide-react"
import type { OnboardingStepId } from "@/lib/onboarding/onboarding.types"
import { ONBOARDING_STEPS } from "@/lib/onboarding/onboarding.constants"

interface OnboardingStepperProps {
  currentStep: OnboardingStepId
}

const OnboardingStepper = ({ currentStep }: OnboardingStepperProps) => {
  const currentIndex = ONBOARDING_STEPS.findIndex(
    (step) => step.id === currentStep
  )

  const progressPercentage =
    ((currentIndex + 1) / ONBOARDING_STEPS.length) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {currentIndex + 1} of {ONBOARDING_STEPS.length}
        </span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        {ONBOARDING_STEPS.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = index < currentIndex

          return (
            <div
              key={step.id}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckIcon className="size-3.5" />
                ) : (
                  index + 1
                )}
              </div>

              <span
                className={`truncate text-xs ${
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OnboardingStepper