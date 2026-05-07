"use client"

import { useState } from "react"
import { PackagePlus, Plus } from "lucide-react"

import CreateInventoryItemForm from "@/components/forms/CreateInventoryItemForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CreateInventoryItemDialogProps {
  disabled?: boolean
  disabledReason?: string
}

export function CreateInventoryItemDialog({
  disabled = false,
  disabledReason = "Inventory is disabled. Go to the Inventory tab and enable it to add items.",
}: CreateInventoryItemDialogProps) {
  const [open, setOpen] = useState(false)

  const trigger = (
    <span>
      <Button size="sm" disabled={disabled}>
        <Plus className="mr-2 size-4" />
        Add item
      </Button>
    </span>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
          </TooltipTrigger>

          {disabled && (
            <TooltipContent side="top" className="max-w-xs">
              {disabledReason}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto p-0">
        <div className="border-b border-border/60 px-6 py-5">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PackagePlus className="size-5" />
              </div>

              <div>
                <DialogTitle>Create inventory item</DialogTitle>
                <DialogDescription className="mt-1">
                  Add a clinical supply, define stock and set the minimum
                  threshold for low-stock alerts.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5">
          <CreateInventoryItemForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}