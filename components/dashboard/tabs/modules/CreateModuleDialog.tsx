"use client"

import { useState } from "react"
import { Plus, LayoutGrid } from "lucide-react"

import { CreateModuleForm } from "@/components/forms/CreateModuleForm"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CreateModuleDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 size-4" />
          New module
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-xl overflow-hidden p-0">
        <div className="border-b border-border/60 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <LayoutGrid className="size-5" />
              </div>

              <div>
                <DialogTitle>Create module</DialogTitle>

                <DialogDescription className="mt-1">
                  Register a dental unit, room, or operatory that can be used
                  for appointment scheduling.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

      <div className="max-h-[calc(90vh-110px)] overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
        <CreateModuleForm onSuccess={() => setOpen(false)} />
      </div>
      </DialogContent>
    </Dialog>
  )
}