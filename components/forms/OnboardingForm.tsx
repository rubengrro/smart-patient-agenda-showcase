"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ONBOARDING_STEPS } from "@/lib/onboarding/onboarding.constants"
import {
  onboardingSchema,
  type OnboardingInput,
} from "@/lib/onboarding/onboarding.schema"
import type { OnboardingStepId } from "@/lib/onboarding/onboarding.types"
import { completeOnboarding } from "@/lib/actions/completeOnboarding"
import OnboardingStepper from "../onboarding/OnboardingStepper"
import OnboardingStepRenderer from "../onboarding/StepRender"
import OnboardingFooter from "../onboarding/Footer"

interface OnboardingFormProps {
  onClose: () => void
}

const OnboardingForm = ({ onClose }: OnboardingFormProps) => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStepId>("clinic")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      clinicName: "",
      firstModuleName: "",
      firstModuleType: "",
    },
    mode: "onTouched",
  })

  const currentIndex = ONBOARDING_STEPS.findIndex(
    (step) => step.id === currentStep
  )

  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === ONBOARDING_STEPS.length - 1
  const isBusy = isSubmitting || isPending

  const currentStepMeta = useMemo(() => {
    return ONBOARDING_STEPS[currentIndex]
  }, [currentIndex])

  const getFieldsForStep = (step: OnboardingStepId): Array<keyof OnboardingInput> => {
    switch (step) {
      case "clinic":
        return ["clinicName"]
      case "module":
        return ["firstModuleName", "firstModuleType"]
      default:
        return []
    }
  }

  const onSubmit = async (values: OnboardingInput) => {
  setSubmitError(null)

  startTransition(async () => {
    const result = await completeOnboarding(values)

    if (!result.success) {
      setSubmitError(result.error)
      return
    }

    onClose()
    router.push(`/${result.clinicSlug}/dashboard`)
  })
}

  const goToNextStep = async () => {
    setSubmitError(null)

    const fieldsToValidate = getFieldsForStep(currentStep)
    const isStepValid = await trigger(fieldsToValidate)

    if (!isStepValid) return

    if (!isLastStep) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex + 1].id)
      return
    }

    await handleSubmit(onSubmit)()
  }

  const goToPreviousStep = () => {
    if (isFirstStep || isBusy) return
    setSubmitError(null)
    setCurrentStep(ONBOARDING_STEPS[currentIndex - 1].id)
  }

  return (
    <div className="space-y-6">
      <OnboardingStepper currentStep={currentStep} />

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{currentStepMeta.title}</h3>
        <p className="text-sm text-muted-foreground">
          {currentStepMeta.description}
        </p>
      </div>

      {submitError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <OnboardingStepRenderer
        currentStep={currentStep}
        register={register}
        errors={errors}
      />

      <OnboardingFooter
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isSubmitting={isBusy}
        onBack={goToPreviousStep}
        onNext={goToNextStep}
      />
    </div>
  )
}

export default OnboardingForm