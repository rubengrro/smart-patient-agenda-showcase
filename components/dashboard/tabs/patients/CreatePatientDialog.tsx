"use client"

import { useState } from "react"
import { Plus, UserPlus } from "lucide-react"

import CreatePatientForm from "@/components/forms/CreatePatientForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CreatePatientDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          Add patient
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto p-0">
        <div className="border-b border-border/60 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserPlus className="size-5" />
              </div>

              <div>
                <DialogTitle>Create patient</DialogTitle>
                <DialogDescription className="mt-1">
                  Register a patient for scheduling and operational reminders.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          <CreatePatientForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}