import EditStaffForm from "@/components/forms/EditStaffForm"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StaffSpecialty } from "@/lib/generated/prisma/enums"
import { StaffWithUser } from "@/types/staff"
import { useState } from "react"
import { mutate } from "swr"

interface EditStaffDialogProps {
  member: StaffWithUser
}

export default function EditStaffDialog({ member }: EditStaffDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/staff/${member.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete staff member.")
      }

      await mutate("/api/staff")

      setOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription className="hidden">-</DialogDescription>
        </DialogHeader>

        <EditStaffForm
          staffId={member.id}
          initialValues={{
            fullName: member.fullName,
            role: member.role,
            specialty: member.specialty,
            customSpecialtyLabel:
              member.specialty === StaffSpecialty.OTHER
                ? member.customSpecialtyLabel ?? ""
                : "",
            active: member.active,
            hasPlatformAccess: !!member.user,
            email: member.user?.email ?? "",
            platformRole: member.user?.role,
          }}
          onSuccess={() => setOpen(false)}
        />

        <div className="border-t pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Delete staff member
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete staff member?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will deactivate the staff member and prevent them from
                  being used in future appointments. Existing historical
                  appointments will remain intact.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  disabled={isDeleting}
                  onClick={handleDelete}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  )
}