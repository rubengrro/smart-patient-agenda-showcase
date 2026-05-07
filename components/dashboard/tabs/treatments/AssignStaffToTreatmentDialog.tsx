"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AssignableStaffMember, AssignableStaffSelector } from "./AssignableStaffSelector"
import { updateTreatmentStaffAssignmentsAction } from "@/lib/actions/updateTreatmentStaffAssignmentsAction"

interface TreatmentForStaffAssignment {
  id: string
  name: string
  requiredSpecialty: string | null
}

interface AssignStaffToTreatmentDialogProps {
  treatment: TreatmentForStaffAssignment
}

interface AssignableStaffResponse {
  staff: AssignableStaffMember[]
}

const fetcher = async (url: string): Promise<AssignableStaffResponse> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch assignable staff.")
  }

  return response.json()
}

export function AssignStaffToTreatmentDialog({
  treatment,
}: AssignStaffToTreatmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const staffUrl = `/api/treatments/${treatment.id}/staff`

  const { data, isLoading } = useSWR<AssignableStaffResponse>(
    open ? staffUrl : null,
    fetcher,
    {
      onSuccess: (response) => {
        const assignedIds = response.staff
          .filter((member) => member.isAssigned)
          .map((member) => member.id)

        setSelectedStaffIds(assignedIds)
      },
    }
  )

  const handleSave = async () => {
    setIsSaving(true)

    const result = await updateTreatmentStaffAssignmentsAction({
      treatmentId: treatment.id,
      staffIds: selectedStaffIds,
    })

    setIsSaving(false)

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success(result.message)

    await mutate(staffUrl)
    await mutate("/api/treatments")

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="mr-2 h-4 w-4" />
          Assign staff
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign staff</DialogTitle>
          <DialogDescription>
            Select which active staff members can perform {treatment.name}.
          </DialogDescription>
        </DialogHeader>

        <AssignableStaffSelector
          staff={data?.staff ?? []}
          selectedStaffIds={selectedStaffIds}
          onChange={setSelectedStaffIds}
          isLoading={isLoading}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save assignments"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}