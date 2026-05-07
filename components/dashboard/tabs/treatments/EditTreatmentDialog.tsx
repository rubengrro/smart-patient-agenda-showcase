"use client"

import { useState } from "react"
import { Pencil, Stethoscope } from "lucide-react"

import {
  EditTreatmentForm,
  type EditableTreatment,
} from "@/components/forms/EditTreatmentForm"
import TreatmentInventoryRequirements from "./TreatmentInventoryRequirements"
import { CreateInventoryItemDialog } from "../inventory/CreateInventoryItemDialog"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { TreatmentEditStepId } from "@/components/forms/treatments/treatmentEditSteps"
import { TreatmentEditStepper } from "./TreatmentEditStepper"

interface EditTreatmentDialogProps {
  treatment: EditableTreatment
}

export function EditTreatmentDialog({ treatment }: EditTreatmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] =
    useState<TreatmentEditStepId>("details")

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      setCurrentStep("details")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 size-4" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] overflow-hidden p-0 sm:max-w-2xl lg:max-w-3xl">
        <div className="border-b border-border/60 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Stethoscope className="size-5" />
              </div>

              <div>
                <DialogTitle>Edit treatment</DialogTitle>
                <DialogDescription className="mt-1">
                  Update treatment rules and operational inventory requirements.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="max-h-[calc(90vh-110px)] overflow-y-auto overflow-x-hidden px-6 py-5">
    <div className="space-y-5">
      <TreatmentEditStepper currentStep={currentStep} />

      {currentStep === "details" && (
        <div className="space-y-5">
          <EditTreatmentForm
            treatment={treatment}
            onSuccess={() => {
              setCurrentStep("inventory")
            }}
          />

          <div className="flex justify-end border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep("inventory")}
            >
              Continue to inventory
            </Button>
          </div>
        </div>
      )}

      {currentStep === "inventory" && (
        <div className="space-y-5">
          <TreatmentInventoryRequirements treatmentId={treatment.id} />

          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep("details")}
            >
              Back
            </Button>

            <div className="flex gap-2">
              <CreateInventoryItemDialog />

              <Button type="button" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</DialogContent>
    </Dialog>
  )
}