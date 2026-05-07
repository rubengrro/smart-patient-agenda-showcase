import type { FieldErrors, UseFormRegister } from "react-hook-form"
import type {
  OnboardingFormValues,
  OnboardingStepId,
} from "@/lib/onboarding/onboarding.types"
import OnboardingClinicStep from "./steps/OnboardingClinicStep"
import OnboardingModuleStep from "./steps/OnboardingModuleStep"

interface OnboardingStepRendererProps {
  currentStep: OnboardingStepId
  register: UseFormRegister<OnboardingFormValues>
  errors: FieldErrors<OnboardingFormValues>
}

const OnboardingStepRenderer = ({
  currentStep,
  register,
  errors,
}: OnboardingStepRendererProps) => {
  switch (currentStep) {
    case "clinic":
      return <OnboardingClinicStep register={register} errors={errors} />
    case "module":
      return <OnboardingModuleStep register={register} errors={errors} />
    default:
      return null
  }
}

export default OnboardingStepRenderer