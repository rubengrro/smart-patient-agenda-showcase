"use client"

import { useState } from "react"
import { Plus, UserRoundPlus } from "lucide-react"

import StaffForm from "@/components/forms/staffForm"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function CreateStaffDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          Create staff
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto p-0">
        <div className="border-b border-border/60 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRoundPlus className="size-5" />
              </div>

              <div>
                <DialogTitle>Create staff member</DialogTitle>
                <DialogDescription className="mt-1">
                  Add a provider or team member and configure their operational role.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          <StaffForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}