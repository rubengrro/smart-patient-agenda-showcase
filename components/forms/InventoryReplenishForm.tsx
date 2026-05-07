"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { mutate } from "swr"
import { toast } from "sonner"
import { PackageCheck } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  InventoryStockMovementInput,
  inventoryStockMovementSchema,
} from "@/lib/validations/inventorySchema"

import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"

interface InventoryReplenishFormProps {
  inventoryItemId: string
  itemName: string
  onSuccess?: () => void
}

const InventoryReplenishForm = ({
  inventoryItemId,
  itemName,
  onSuccess,
}: InventoryReplenishFormProps) => {
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<InventoryStockMovementInput>({
    resolver: zodResolver(inventoryStockMovementSchema),
    defaultValues: {
      quantity: undefined,
      notes: "",
    },
  })

  const onSubmit = (values: InventoryStockMovementInput) => {
    setFormError(null)

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/inventory/${inventoryItemId}/replenish`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          setFormError(data.error ?? "Could not replenish stock.")
          return
        }

        toast.success("Stock replenished.")
        form.reset({
          quantity: undefined,
          notes: "",
        })

        await Promise.all([
          mutate("/api/inventory"),
          mutate("/api/inventory/movements"),
        ])

        onSuccess?.()
      } catch (error) {
        console.error("InventoryReplenishForm error:", error)
        setFormError("Something went wrong while replenishing stock.")
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {formError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PackageCheck className="size-4" />
          </div>

          <div>
            <p className="text-sm font-medium">Replenish inventory</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add new stock to{" "}
              <span className="font-medium text-foreground">{itemName}</span>{" "}
              and register an inventory movement.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quantity">Quantity to add</Label>

        <Input
          id="quantity"
          type="number"
          min={1}
          className="h-11 rounded-xl"
          placeholder="10"
          {...form.register("quantity", {
            valueAsNumber: true,
          })}
        />

        {form.formState.errors.quantity && (
          <p className="text-sm text-destructive">
            {form.formState.errors.quantity.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>

        <Textarea
          id="notes"
          className="min-h-24 rounded-xl"
          placeholder="Example: Restocked from supplier order..."
          {...form.register("notes")}
        />

        <p className="text-xs text-muted-foreground">
          Keep this operational: supplier, batch, purchase order or internal
          reason.
        </p>

        {form.formState.errors.notes && (
          <p className="text-sm text-destructive">
            {form.formState.errors.notes.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-xl"
      >
        {isPending ? "Replenishing..." : "Replenish stock"}
      </Button>
    </form>
  )
}

export default InventoryReplenishForm