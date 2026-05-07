"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState, useTransition, useCallback } from "react"
import { useForm, useWatch } from "react-hook-form"
import useSWR, { mutate } from "swr"

import {
  createAppointmentSchema,
  type CreateAppointmentInput,
} from "@/lib/validations/appointmentSchema"
import { AppointmentStatus } from "@/lib/generated/prisma/enums"

import { Button } from "@/components/ui/button"

import {
  APPOINTMENT_STEPS,
  type AppointmentStepId,
} from "@/components/forms/appointments/appointmentSteps"
import { AppointmentStepper } from "@/components/forms/appointments/AppointmentStepper"
import { AppointmentDetailsStep } from "@/components/forms/appointments/AppointmentDetailsStep"
import { AppointmentAssignmentValidationStep } from "@/components/forms/appointments/AppointmentAssignmentValidationStep"

interface CreateAppointmentFormProps {
  selectedDate: string
  onSuccess?: () => void
}

interface PatientOption {
  id: string
  fullName: string
  active: boolean
}

interface TreatmentOption {
  id: string
  name: string
  active: boolean
}

interface StaffOption {
  id: string
  fullName: string
  active: boolean
}

interface ModuleOption {
  id: string
  name: string
  active: boolean
  status: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  estimatedDurationMin: number
  calculatedEndTime: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const CreateAppointmentForm = ({
  selectedDate,
  onSuccess,
}: CreateAppointmentFormProps) => {
  const [currentStep, setCurrentStep] =
    useState<AppointmentStepId>("details")

  const [formError, setFormError] = useState<string | null>(null)
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null)

  const [isPending, startTransition] = useTransition()
  const [isValidating, setIsValidating] = useState(false)

  const { data: patientsData } = useSWR("/api/patients", fetcher)
  const { data: treatmentsData } = useSWR("/api/treatments", fetcher)
  const { data: staffData } = useSWR("/api/staff", fetcher)
  const { data: modulesData } = useSWR("/api/modules", fetcher)

  const patients: PatientOption[] = patientsData?.patients ?? []
  const treatments: TreatmentOption[] = treatmentsData?.treatments ?? []
  const staffMembers: StaffOption[] = Array.isArray(staffData) ? staffData : []
  const modules: ModuleOption[] = modulesData?.modules ?? []

  const form = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      patientId: "",
      treatmentId: "",
      staffId: "",
      moduleId: "",
      status: AppointmentStatus.SCHEDULED,
      date: selectedDate,
      startTime: "09:00",
      notes: "",
    },
  })

  const watchedValues = useWatch({
    control: form.control,
  })

  const status = useWatch({
    control: form.control,
    name: "status",
  })

  const currentStepIndex = APPOINTMENT_STEPS.findIndex(
    (step) => step.id === currentStep
  )

  const canAutoValidate = useMemo(() => {
    return Boolean(
      watchedValues.patientId &&
        watchedValues.treatmentId &&
        watchedValues.date &&
        watchedValues.startTime &&
        watchedValues.staffId &&
        watchedValues.moduleId
    )
  }, [
    watchedValues.patientId,
    watchedValues.treatmentId,
    watchedValues.date,
    watchedValues.startTime,
    watchedValues.staffId,
    watchedValues.moduleId,
  ])


  const validateCandidate = useCallback(async () => {
    setFormError(null)
    setValidationResult(null)
    setIsValidating(true)

    const values = form.getValues()

    try {
      const response = await fetch("/api/appointments/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        setFormError(data.error ?? "Could not validate appointment.")
        return
      }

      setValidationResult(data.result)
    } catch (error) {
      console.error("validateCandidate error:", error)
      setFormError("Something went wrong while validating the appointment.")
    } finally {
      setIsValidating(false)
    }
  }, [form])

  useEffect(() => {
  if (currentStep !== "assignment") return
  if (!canAutoValidate) return

  const timeoutId = window.setTimeout(() => {
    validateCandidate()
  }, 500)

  return () => window.clearTimeout(timeoutId)
}, [currentStep, canAutoValidate, validateCandidate])

  const goToNextStep = async () => {
    setFormError(null)
    const isStepValid = await form.trigger([
      "patientId",
      "treatmentId",
      "date",
      "startTime",
    ])

    if (!isStepValid) return

    setCurrentStep("assignment")
  }

  const goToPreviousStep = () => {
    setFormError(null)
    setCurrentStep("details")
  }

  const onSubmit = (values: CreateAppointmentInput) => {
    setFormError(null)

    startTransition(async () => {
      try {
        const response = await fetch("/api/appointments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })

        const data = await response.json()

        if (!response.ok) {
          setFormError(data.error ?? "Could not create appointment.")
          setValidationResult(data.validation ?? null)
          return
        }

        await mutate(`/api/appointments?date=${values.date}`)
        await mutate(`/api/agenda/activity?date=${values.date}`)

        onSuccess?.()
      } catch (error) {
        console.error("CreateAppointmentForm error:", error)
        setFormError("Something went wrong while creating the appointment.")
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <AppointmentStepper currentStep={currentStep} />

      {formError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      {currentStep === "details" && (
        <AppointmentDetailsStep
          form={form}
          patients={patients}
          treatments={treatments}
        />
      )}

      {currentStep === "assignment" && (
        <AppointmentAssignmentValidationStep
          form={form}
          status={status ?? AppointmentStatus.SCHEDULED}
          staffMembers={staffMembers}
          modules={modules}
          validationResult={validationResult}
        />
      )}

      <div className="flex items-center justify-between border-t border-border/60 pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isPending || isValidating || currentStepIndex === 0}
          onClick={goToPreviousStep}
        >
          Back
        </Button>

        {currentStep === "details" ? (
          <Button type="button" onClick={goToNextStep}>
            Continue
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={
              isPending ||
              isValidating ||
              !validationResult ||
              !validationResult.isValid
            }
          >
            {isPending
              ? "Creating..."
              : isValidating
              ? "Validating..."
              : "Create appointment"}
          </Button>
        )}
      </div>
    </form>
  )
}

export default CreateAppointmentForm