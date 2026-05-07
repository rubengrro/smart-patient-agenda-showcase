"use client"

import { useState } from "react"
import { Pencil, UserPen } from "lucide-react"

import EditPatientForm from "@/components/forms/EditPatientForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Patient {
  id: string
  fullName: string
  phone: string
  email: string | null
  dateOfBirth: string | null
  active: boolean
  preferredStaff: {
    id: string
    fullName: string
  } | null
}

interface EditPatientDialogProps {
  patient: Patient
}

export function EditPatientDialog({ patient }: EditPatientDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 size-4" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto p-0">
        <div className="border-b border-border/60 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserPen className="size-5" />
              </div>

              <div>
                <DialogTitle>Edit patient</DialogTitle>
                <DialogDescription className="mt-1">
                  Update patient contact information and operational preferences.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          <EditPatientForm patient={patient} onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}