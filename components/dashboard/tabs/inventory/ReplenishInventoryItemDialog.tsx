"use client"

import { useState } from "react"
import { PackagePlus } from "lucide-react"

import InventoryReplenishForm from "@/components/forms/InventoryReplenishForm"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface InventoryItem {
  id: string
  name: string
}

interface ReplenishInventoryItemDialogProps {
  item: InventoryItem
  disabled?: boolean
}

export function ReplenishInventoryItemDialog({
  item,
  disabled = false,
}: ReplenishInventoryItemDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" disabled={disabled}>
          <PackagePlus className="mr-2 size-4" />
          Replenish
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-xl overflow-hidden p-0">
        <div className="border-b border-border/60 px-5 py-5 sm:px-6">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PackagePlus className="size-5" />
              </div>

              <div>
                <DialogTitle>Replenish stock</DialogTitle>
                <DialogDescription className="mt-1">
                  Add stock to <span className="font-medium text-foreground">{item.name}</span> and register an inventory movement.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="max-h-[calc(90vh-110px)] overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
          <InventoryReplenishForm
            inventoryItemId={item.id}
            itemName={item.name}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}