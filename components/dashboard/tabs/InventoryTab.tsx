"use client"

import React from "react"
import useSWR from "swr"
import { Package } from "lucide-react"
import { CreateInventoryItemDialog } from "./inventory/CreateInventoryItemDialog"
import InventoryList from "./inventory/InventoryList"
import InventoryMovementLog from "./inventory/InventoryMovementLog"
import InventorySettingsCard from "./inventory/InventorySettingsCard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const InventoryTab = () => {
  const { data } = useSWR("/api/inventory/settings", fetcher)
  const inventoryEnabled = data?.settings?.inventoryEnabled ?? false

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold tracking-tight">Inventory</h2>
          </div>

          <p className="max-w-2xl text-sm text-muted-foreground">
            Manage clinical supplies, stock thresholds, and stock movements used
            by treatments and clinic operations.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <CreateInventoryItemDialog disabled={!inventoryEnabled} />
          <InventorySettingsCard />
        </div>
      </div>

      {!inventoryEnabled && (
        <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
          Inventory tracking is disabled. You can keep scheduling appointments,
          but stock alerts, replenishment actions, and inventory validations are locked.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Inventory items</CardTitle>
          <CardDescription>
            Active supplies available for stock tracking and treatment planning.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <InventoryList inventoryEnabled={inventoryEnabled} />
        </CardContent>
      </Card>

      {inventoryEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory activity</CardTitle>
            <CardDescription>
              Recent stock movements, replenishments, and operational changes.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <InventoryMovementLog />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default InventoryTab