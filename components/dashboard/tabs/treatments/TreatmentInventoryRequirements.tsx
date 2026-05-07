"use client"

import { useMemo, useState, useTransition } from "react"
import useSWR, { mutate } from "swr"
import { PackagePlus, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InventoryItem {
  id: string
  name: string
  unit: string
  stock: number
  minStock: number
  active: boolean
}

interface InventoryResponse {
  items: InventoryItem[]
}

interface RequirementResponse {
  requirements: {
    id: string
    inventoryItemId: string
    quantity: number
    inventoryItem: InventoryItem
  }[]
}

interface RequirementDraft {
  inventoryItemId: string
  quantity: number
}

interface TreatmentInventoryRequirementsProps {
  treatmentId: string
}

const fetcher = async (url: string) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch data.")
  }

  return response.json()
}

export default function TreatmentInventoryRequirements({
  treatmentId,
}: TreatmentInventoryRequirementsProps) {
  const [isPending, startTransition] = useTransition()
  const [drafts, setDrafts] = useState<RequirementDraft[] | null>(null)

  const { data: inventoryData } = useSWR<InventoryResponse>(
    "/api/inventory",
    fetcher
  )

  const { data: requirementsData } = useSWR<RequirementResponse>(
    `/api/treatments/${treatmentId}/inventory`,
    fetcher
  )

  const inventoryItems = useMemo(() => {
    return inventoryData?.items?.filter((item) => item.active) ?? []
  }, [inventoryData?.items])

  const requirements = useMemo(() => {
    if (drafts) return drafts

    return (
      requirementsData?.requirements.map((requirement) => ({
        inventoryItemId: requirement.inventoryItemId,
        quantity: requirement.quantity,
      })) ?? []
    )
  }, [drafts, requirementsData?.requirements])

  const addRequirement = () => {
    setDrafts((current) => {
      const source = current ?? requirements

      return [
        ...source,
        {
          inventoryItemId: "",
          quantity: 1,
        },
      ]
    })
  }

  const updateRequirement = (
    index: number,
    updates: Partial<RequirementDraft>
  ) => {
    setDrafts((current) => {
      const source = current ?? requirements

      return source.map((requirement, currentIndex) =>
        currentIndex === index ? { ...requirement, ...updates } : requirement
      )
    })
  }

  const removeRequirement = (index: number) => {
    setDrafts((current) => {
      const source = current ?? requirements

      return source.filter((_, currentIndex) => currentIndex !== index)
    })
  }

  const saveRequirements = () => {
    startTransition(async () => {
      const validRequirements = requirements.filter(
        (requirement) => requirement.inventoryItemId && requirement.quantity > 0
      )

      const response = await fetch(`/api/treatments/${treatmentId}/inventory`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requirements: validRequirements,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error ?? "Failed to save inventory requirements.")
        return
      }

      toast.success("Inventory requirements updated.")

      await mutate(`/api/treatments/${treatmentId}/inventory`)
      setDrafts(null)
    })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PackagePlus className="size-4" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight">
            Inventory requirements
          </h3>

          <p className="text-sm text-muted-foreground">
            Define the supplies usually consumed when this treatment is
            completed.
          </p>
        </div>
      </div>

      {requirements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
          No inventory requirements assigned yet. Add items to make inventory
          validation available during scheduling and completion.
        </div>
      ) : (
        <div className="space-y-3">
          {requirements.map((requirement, index) => (
            <div
              key={`${requirement.inventoryItemId}-${index}`}
              className="grid gap-3 rounded-xl border border-border/60 bg-background p-3 md:grid-cols-[1fr_120px_auto]"
            >
              <div className="space-y-1.5">
                <Label>Inventory item</Label>

                <Select
                  value={requirement.inventoryItemId}
                  onValueChange={(value) => {
                    updateRequirement(index, { inventoryItemId: value })
                  }}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select inventory item" />
                  </SelectTrigger>

                  <SelectContent position="popper" className="z-70">
                    {inventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} · {item.stock} {item.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Qty</Label>

                <Input
                  type="number"
                  min={1}
                  className="h-11 rounded-xl"
                  value={requirement.quantity}
                  onChange={(event) => {
                    updateRequirement(index, {
                      quantity: Number(event.target.value),
                    })
                  }}
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-11 rounded-xl"
                  onClick={() => removeRequirement(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={addRequirement}>
          <Plus className="mr-2 size-4" />
          Add item
        </Button>

        <Button type="button" onClick={saveRequirements} disabled={isPending}>
          {isPending ? "Saving..." : "Save requirements"}
        </Button>
      </div>
    </section>
  )
}