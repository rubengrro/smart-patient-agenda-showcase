"use client"

import { useMemo, useState, useTransition } from "react"
import useSWR, { mutate } from "swr"
import { Plus, Trash2, AlertTriangle, FileText, Package } from "lucide-react"
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

interface ConsumptionDraft {
  inventoryItemId: string
  quantity: number
}

interface CompleteAppointmentPanelProps {
  appointmentId: string
  treatmentId: string
  selectedDate: string
  onCompleted?: () => void
}

const fetcher = async (url: string) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch data.")
  }

  return response.json()
}

export function CompleteAppointmentPanel({
  appointmentId,
  treatmentId,
  selectedDate,
  onCompleted,
}: CompleteAppointmentPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [drafts, setDrafts] = useState<ConsumptionDraft[] | null>(null)
  const [notes, setNotes] = useState("")
  const [step, setStep] = useState<"inventory" | "confirmation">("inventory")

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

  const consumptions = useMemo(() => {
    if (drafts) return drafts

    return (
      requirementsData?.requirements.map((requirement) => ({
        inventoryItemId: requirement.inventoryItemId,
        quantity: requirement.quantity,
      })) ?? []
    )
  }, [drafts, requirementsData?.requirements])

  const inventoryById = useMemo(() => {
    return new Map(inventoryItems.map((item) => [item.id, item]))
  }, [inventoryItems])

  const addConsumption = () => {
    setDrafts((current) => {
      const source = current ?? consumptions

      return [
        ...source,
        {
          inventoryItemId: "",
          quantity: 1,
        },
      ]
    })
  }

  const updateConsumption = (
    index: number,
    updates: Partial<ConsumptionDraft>
  ) => {
    setDrafts((current) => {
      const source = current ?? consumptions

      return source.map((consumption, currentIndex) =>
        currentIndex === index ? { ...consumption, ...updates } : consumption
      )
    })
  }

  const removeConsumption = (index: number) => {
    setDrafts((current) => {
      const source = current ?? consumptions
      return source.filter((_, currentIndex) => currentIndex !== index)
    })
  }

  const handleComplete = () => {
    startTransition(async () => {
      const validConsumptions = consumptions.filter(
        (consumption) =>
          consumption.inventoryItemId && consumption.quantity > 0
      )

      const response = await fetch(
        `/api/appointments/${appointmentId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            consumptions: validConsumptions,
            notes,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error ?? "Failed to complete appointment.")
        return
      }

      toast.success("Appointment completed.")

      await mutate(`/api/appointments?date=${selectedDate}`)
      await mutate("/api/inventory")
      await mutate(`/api/agenda/activity?date=${selectedDate}`)

      setDrafts(null)
      setNotes("")
      onCompleted?.()
    })
  }

  const hasStockIssues = consumptions.some((consumption) => {
  const item = inventoryById.get(consumption.inventoryItemId)

  return Boolean(item && item.stock < consumption.quantity)
})

  return (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/20 p-1">
      <button
        type="button"
        onClick={() => setStep("inventory")}
        className={[
          "rounded-lg px-3 py-2 text-xs font-medium transition",
          step === "inventory"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        ].join(" ")}
      >
        1. Inventory
      </button>

      <button
        type="button"
        onClick={() => setStep("confirmation")}
        className={[
          "rounded-lg px-3 py-2 text-xs font-medium transition",
          step === "confirmation"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        ].join(" ")}
      >
        2. Confirm
      </button>
    </div>

    {step === "inventory" && (
      <section className="rounded-xl border bg-muted/20 p-4">
        <div className="mb-3 flex items-center gap-2">
        <Package className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Inventory consumption</h3>
      </div>

        <div className="max-h-90 space-y-3 overflow-y-auto pr-1">
          {consumptions.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-background/60 p-4">
              <p className="text-sm font-medium">
                No required items configured
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                This treatment has no inventory requirements yet. You can still
                complete the appointment or add consumed items manually.
              </p>
            </div>
          ) : (
            consumptions.map((consumption, index) => {
              const item = inventoryById.get(consumption.inventoryItemId)
              const hasStockIssue = Boolean(
                item && item.stock < consumption.quantity
              )

              return (
                <div
                  key={`${consumption.inventoryItemId}-${index}`}
                  className={[
                    "rounded-xl border bg-background/70 p-3",
                    hasStockIssue && "border-destructive/40 bg-destructive/5",
                  ].join(" ")}
                >
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_48px]">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Inventory item
                      </Label>

                      <Select
                        value={consumption.inventoryItemId}
                        onValueChange={(value) =>
                          updateConsumption(index, { inventoryItemId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select inventory item" />
                        </SelectTrigger>

                        <SelectContent>
                          {inventoryItems.map((inventoryItem) => (
                            <SelectItem
                              key={inventoryItem.id}
                              value={inventoryItem.id}
                            >
                              {inventoryItem.name} ({inventoryItem.stock}{" "}
                              {inventoryItem.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">
                        Quantity
                      </Label>

                      <Input
                        type="number"
                        min={1}
                        value={consumption.quantity}
                        onChange={(event) =>
                          updateConsumption(index, {
                            quantity: Number(event.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => removeConsumption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {item && (
                    <div className="mt-3 rounded-lg border bg-muted/30 px-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        Available stock:{" "}
                        <span className="font-medium text-foreground">
                          {item.stock} {item.unit}
                        </span>
                      </p>
                    </div>
                  )}

                  {hasStockIssue && item && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        Not enough stock for {item.name}. Available:{" "}
                        {item.stock} {item.unit}.
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={addConsumption}>
            <Plus className="mr-2 h-4 w-4" />
            Add extra item
          </Button>

          <Button
            type="button"
            onClick={() => setStep("confirmation")}
            disabled={hasStockIssues}
          >
            Continue
          </Button>
        </div>
      </section>
    )}

    {step === "confirmation" && (
      <section className="rounded-xl border bg-muted/20 p-4">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Operational note</h3>
        </div>

        <Input
          value={notes}
          maxLength={280}
          placeholder="Short operational note. Avoid clinical evolution notes."
          onChange={(event) => setNotes(event.target.value)}
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Keep this as an operational reminder, not a clinical record.
          </p>

          <p className="shrink-0 text-xs text-muted-foreground">
            {notes.length}/280
          </p>
        </div>

        <div className="mt-5 rounded-xl border bg-background/70 p-3">
          <p className="text-sm font-medium">Completion summary</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {consumptions.length} inventory item
            {consumptions.length === 1 ? "" : "s"} will be registered when this
            appointment is completed.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("inventory")}
            disabled={isPending}
          >
            Back
          </Button>

          <Button
            type="button"
            disabled={isPending}
            onClick={handleComplete}
          >
            {isPending ? "Completing..." : "Confirm completion"}
          </Button>
        </div>
      </section>
    )}
  </div>
)
}