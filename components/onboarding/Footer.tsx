import { Button } from "@/components/ui/button"

interface OnboardingFooterProps {
  isFirstStep: boolean
  isLastStep: boolean
  isSubmitting: boolean
  onBack: () => void
  onNext: () => void
}

const OnboardingFooter = ({
  isFirstStep,
  isLastStep,
  isSubmitting,
  onBack,
  onNext,
}: OnboardingFooterProps) => {
  return (
    <div className="flex items-center justify-between border-t pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={isFirstStep || isSubmitting}
      >
        Back
      </Button>

      <Button type="button" onClick={onNext} disabled={isSubmitting}>
        {isLastStep
          ? isSubmitting
            ? "Finishing..."
            : "Finish setup"
          : "Next"}
      </Button>
    </div>
  )
}

export default OnboardingFooter