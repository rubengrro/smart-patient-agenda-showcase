"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { mutate } from "swr"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  createInventoryItemSchema,
  type CreateInventoryItemInput,
} from "@/lib/validations/inventorySchema"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateInventoryItemFormProps {
  onSuccess?: () => void
}

export default function CreateInventoryItemForm({
  onSuccess,
}: CreateInventoryItemFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateInventoryItemInput>({
    resolver: zodResolver(createInventoryItemSchema),
    defaultValues: {
      name: "",
      unit: "",
      stock: undefined,
      minStock: undefined,
      active: true,
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          active: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === "INVENTORY_DISABLED") {
          toast.error("Inventory is disabled", {
            description:
              "Go to the Inventory tab and enable tracking before adding supplies.",
          })
          return
        }

        toast.error(data.error ?? "Could not create inventory item.")
        return
      }

      toast.success("Inventory item created.")
      form.reset({
        name: "",
        unit: "",
        stock: undefined,
        minStock: undefined,
        active: true,
      })

      await mutate("/api/inventory")
      onSuccess?.()
    })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <p className="text-sm font-medium">Clinical supply</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add supplies used by treatments and inventory-aware appointment
          validation.
        </p>
      </div>

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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="inventory-unit">Unit</Label>
          <Input
            id="inventory-unit"
            className="h-11 rounded-xl"
            placeholder="kit, box, pair..."
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

        <p className="text-xs text-muted-foreground">
          Used to trigger low-stock warnings during scheduling and completion.
        </p>

        {form.formState.errors.minStock && (
          <p className="text-sm text-destructive">
            {form.formState.errors.minStock.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-xl"
      >
        {isPending ? "Creating item..." : "Create inventory item"}
      </Button>
    </form>
  )
}