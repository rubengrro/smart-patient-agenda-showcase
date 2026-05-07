"use client"

import useSWR, { mutate } from "swr"
import { useState, useTransition } from "react"
import { Switch } from "@/components/ui/switch"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const InventorySettingsCard = () => {
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { data, isLoading } = useSWR("/api/inventory/settings", fetcher)

  const inventoryEnabled = data?.settings?.inventoryEnabled ?? false

  const handleToggle = (checked: boolean) => {
    setFormError(null)

    startTransition(async () => {
      try {
        const response = await fetch("/api/inventory/settings", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inventoryEnabled: checked }),
        })

        const result = await response.json()

        if (!response.ok) {
          setFormError(result.error ?? "Could not update inventory settings.")
          return
        }

        await mutate("/api/inventory/settings")

        await mutate("/api/inventory")
      } catch (error) {
        console.error("InventorySettingsCard error:", error)
        setFormError("Something went wrong while updating inventory settings.")
      }
    })
  }

  return (
  <div className="flex items-center gap-3 rounded-full border bg-background px-3 py-2 shadow-sm">
    <span className="text-sm font-medium">Inventory tracking</span>

    <Switch
      checked={inventoryEnabled}
      disabled={isLoading || isPending}
      onCheckedChange={handleToggle}
    />

    {formError && (
      <span className="text-xs text-red-500">
        Update failed
      </span>
    )}
  </div>
)
}

export default InventorySettingsCard