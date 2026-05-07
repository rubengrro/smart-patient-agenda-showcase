"use client"

import { useState } from "react"
import { mutate } from "swr"
import { Package, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import EditInventoryItemForm from "@/components/forms/EditInventoryItemForm"

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

interface InventoryItem {
  id: string
  name: string
  description: string | null
  unit: string
  stock: number
  minStock: number
  active: boolean
}

interface EditInventoryItemDialogProps {
  item: InventoryItem
  disabled?: boolean
}

export function EditInventoryItemDialog({
  item,
  disabled = false,
}: EditInventoryItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: "DELETE",
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        toast.error(data?.error ?? "Failed to delete inventory item.")
        return
      }

      toast.success("Inventory item archived.")
      await mutate("/api/inventory")

      setOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Pencil className="mr-2 size-4" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-xl overflow-hidden p-0">
        <div className="border-b border-border/60 px-5 py-5 sm:px-6">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Package className="size-5" />
              </div>

              <div>
                <DialogTitle>Edit inventory item</DialogTitle>
                <DialogDescription className="mt-1">
                  Update stock settings, thresholds and operational status.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="max-h-[calc(90vh-110px)] overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
          <div className="space-y-5">
            <EditInventoryItemForm item={item} onSuccess={() => setOpen(false)} />

            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                  Danger zone
                </p>
                <p className="text-sm text-muted-foreground">
                  Archive this item and hide it from daily operations. Historical
                  movements and treatment references can remain available.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="mt-4 h-10 w-full rounded-xl"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Archive inventory item
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Archive inventory item?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will hide the item from daily inventory operations.
                      Historical records can remain available for audit and
                      reporting.
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
                      {isDeleting ? "Archiving..." : "Archive item"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}