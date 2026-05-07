"use client"

import { useState } from "react"
import { LayoutGrid, Pencil } from "lucide-react"

import {
  EditModuleForm,
  type EditableModule,
} from "@/components/forms/EditModuleForm"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EditModuleDialogProps {
  module: EditableModule
}

export function EditModuleDialog({ module }: EditModuleDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 size-4" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-xl overflow-hidden p-0">
        <div className="border-b border-border/60 px-5 py-5 sm:px-6">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <LayoutGrid className="size-5" />
              </div>

              <div>
                <DialogTitle>Edit module</DialogTitle>

                <DialogDescription className="mt-1">
                  Update module type, operational status and scheduling
                  availability.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="max-h-[calc(90vh-110px)] overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
          <EditModuleForm module={module} onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}