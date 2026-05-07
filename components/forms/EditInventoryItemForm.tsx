"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { mutate } from "swr"
import { toast } from "sonner"

import {
  UpdateInventoryItemInput,
  updateInventoryItemSchema,
} from "@/lib/validations/inventorySchema"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

interface InventoryItem {
  id: string
  name: string
  description: string | null
  unit: string
  stock: number
  minStock: number
  active: boolean
}

interface EditInventoryItemFormProps {
  item: InventoryItem
  onSuccess?: () => void
}

const EditInventoryItemForm = ({
  item,
  onSuccess,
}: EditInventoryItemFormProps) => {
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<UpdateInventoryItemInput>({
    resolver: zodResolver(updateInventoryItemSchema),

    defaultValues: {
      name: item.name,
      description: item.description ?? "",
      unit: item.unit,
      stock: item.stock,
      minStock: item.minStock,
      active: item.active,
    },
  })

  const onSubmit = (values: UpdateInventoryItemInput) => {
    setFormError(null)

    startTransition(async () => {
      try {
        const response = await fetch(`/api/inventory/${item.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })

        const data = await response.json()

        if (!response.ok) {
          setFormError(data.error ?? "Could not update inventory item.")
          return
        }

        toast.success("Inventory item updated.")
        await mutate("/api/inventory")

        onSuccess?.()
      } catch (error) {
        console.error("EditInventoryItemForm error:", error)

        setFormError(
          "Something went wrong while updating the inventory item."
        )
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

      <div className="space-y-1.5">
        <Label htmlFor="inventory-name">Item name</Label>

        <Input
          id="inventory-name"
          className="h-11 rounded-xl"
          placeholder="Composite Resin Kit"
          {...form.register("name")}
        />

        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inventory-description">Description</Label>

        <Input
          id="inventory-description"
          className="h-11 rounded-xl"
          placeholder="Optional operational notes..."
          {...form.register("description")}
        />

        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
            <Label htmlFor="inventory-unit">Unit</Label>

            <Input
            id="inventory-unit"
            className="h-11 rounded-xl"
            placeholder="pair, box, kit..."
            {...form.register("unit")}
            />

            {form.formState.errors.unit && (
            <p className="text-sm text-destructive">
                {form.formState.errors.unit.message}
            </p>
            )}
        </div>

        <div className="space-y-1.5">
            <Label htmlFor="inventory-stock">Current stock</Label>

            <Input
            id="inventory-stock"
            type="number"
            min={0}
            className="h-11 rounded-xl"
            placeholder="25"
            {...form.register("stock", {
                valueAsNumber: true,
            })}
            />

            {form.formState.errors.stock && (
            <p className="text-sm text-destructive">
                {form.formState.errors.stock.message}
            </p>
            )}
        </div>
        </div>

        <div className="space-y-1.5">
        <Label htmlFor="inventory-min-stock">Minimum stock</Label>

        <Input
            id="inventory-min-stock"
            type="number"
            min={0}
            className="h-11 rounded-xl"
            placeholder="5"
            {...form.register("minStock", {
            valueAsNumber: true,
            })}
        />

        {form.formState.errors.minStock && (
            <p className="text-sm text-destructive">
            {form.formState.errors.minStock.message}
            </p>
        )}
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <p className="text-sm font-medium">Low-stock threshold</p>

        <p className="mt-1 text-sm leading-6 text-muted-foreground">
            The scheduling engine can generate warnings when inventory falls below the
            configured minimum.
        </p>
        </div>

      <Button
        className="h-11 w-full rounded-xl"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Saving changes..." : "Save changes"}
      </Button>
    </form>
  )
}

export default EditInventoryItemForm