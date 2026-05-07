import { Layers3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import type { OnboardingFormValues } from "@/lib/onboarding/onboarding.types"

interface OnboardingModuleStepProps {
  register: UseFormRegister<OnboardingFormValues>
  errors: FieldErrors<OnboardingFormValues>
}

const OnboardingModuleStep = ({
  register,
  errors,
}: OnboardingModuleStepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Layers3 className="size-4 text-primary" />

          <h3 className="text-base font-medium tracking-tight">
            First treatment module
          </h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Create the first operational unit for appointments and treatments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstModuleName">
            Module name
          </Label>

          <Input
            id="firstModuleName"
            placeholder="Unit 1"
            {...register("firstModuleName")}
          />

          {errors.firstModuleName ? (
            <p className="text-sm text-destructive">
              {errors.firstModuleName.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Example: Unit 1, Chair A, Surgery Room.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstModuleType">
            Module type
          </Label>

          <Input
            id="firstModuleType"
            placeholder="General"
            {...register("firstModuleType")}
          />

          {errors.firstModuleType ? (
            <p className="text-sm text-destructive">
              {errors.firstModuleType.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Optional operational classification.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default OnboardingModuleStep