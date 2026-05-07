"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  StaffRole,
  StaffSpecialty,
} from "@/lib/generated/prisma/enums"

export interface AssignableStaffMember {
  id: string
  fullName: string
  role: StaffRole
  specialty: StaffSpecialty
  customSpecialtyLabel: string | null
  active: boolean
  isAssigned: boolean
}

interface AssignableStaffSelectorProps {
  staff: AssignableStaffMember[]
  selectedStaffIds: string[]
  onChange: (staffIds: string[]) => void
  isLoading?: boolean
}

function getSpecialtyLabel(member: AssignableStaffMember) {
  if (member.specialty === StaffSpecialty.OTHER) {
    return member.customSpecialtyLabel ?? "Other"
  }

  return member.specialty
}

export function AssignableStaffSelector({
  staff,
  selectedStaffIds,
  onChange,
  isLoading = false,
}: AssignableStaffSelectorProps) {
  const toggleStaff = (staffId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedStaffIds, staffId])
      return
    }

    onChange(selectedStaffIds.filter((id) => id !== staffId))
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Assigned staff</Label>
        <p className="text-sm text-muted-foreground">
          Select active staff compatible with this treatment.
        </p>
      </div>

      <Input
        disabled
        placeholder="Search staff soon..."
      />

      <div className="space-y-2">
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Loading compatible staff...
          </p>
        )}

        {!isLoading && staff.length === 0 && (
          <p className="rounded-md border p-3 text-sm text-muted-foreground">
            No compatible active staff found.
          </p>
        )}

        {!isLoading &&
          staff.map((member) => {
            const isChecked = selectedStaffIds.includes(member.id)

            return (
              <label
                key={member.id}
                className="flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 hover:bg-muted/50"
              >
                <div>
                  <p className="text-sm font-medium">{member.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.role} · {getSpecialtyLabel(member)}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(event) =>
                    toggleStaff(member.id, event.target.checked)
                  }
                />
              </label>
            )
          })}
      </div>
    </div>
  )
}