import { Building2, Link2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UseFormRegister, FieldErrors } from "react-hook-form"
import type { OnboardingFormValues } from "@/lib/onboarding/onboarding.types"

interface OnboardingClinicStepProps {
  register: UseFormRegister<OnboardingFormValues>
  errors: FieldErrors<OnboardingFormValues>
}

const OnboardingClinicStep = ({
  register,
  errors,
}: OnboardingClinicStepProps) => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </div>

          <div className="space-y-1">
            <h3 className="font-medium tracking-tight">
              Create your clinic workspace
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              This workspace will contain your patients, staff, treatments,
              modules, inventory, schedule and appointments.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinicName">Clinic name</Label>

        <Input
          id="clinicName"
          placeholder="e.g. Smile Studio Dental Clinic"
          autoComplete="organization"
          {...register("clinicName")}
        />

        {errors.clinicName ? (
          <p className="text-sm text-destructive">
            {errors.clinicName.message}
          </p>
        ) : (
          <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
            <Link2 className="mt-0.5 size-4 shrink-0" />
            Your clinic URL will be generated automatically from this name.
          </p>
        )}
      </div>
    </div>
  )
}

export default OnboardingClinicStep