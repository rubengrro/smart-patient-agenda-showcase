"use client"

import useSWR from "swr"
import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface InventoryMovement {
  id: string
  type: string
  quantity: number
  previousStock: number
  newStock: number
  notes: string | null
  createdAt: string

  inventoryItem: {
    name: string
    unit: string
  }

  createdByUser: {
    name: string
    email: string
  } | null
}

const MOVEMENTS_PER_PAGE = 5

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const InventoryMovementLog = () => {
  const [page, setPage] = useState(1)

  const { data, error, isLoading } = useSWR(
    "/api/inventory/movements",
    fetcher
  )

  const movements = useMemo<InventoryMovement[]>(() => {
    return data?.movements ?? []
  }, [data?.movements])

  const totalPages = Math.max(1, Math.ceil(movements.length / MOVEMENTS_PER_PAGE))

  const paginatedMovements = useMemo(() => {
    const start = (page - 1) * MOVEMENTS_PER_PAGE
    const end = start + MOVEMENTS_PER_PAGE

    return movements.slice(start, end)
  }, [movements, page])

  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading inventory movements...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load inventory movements.
      </div>
    )
  }

  if (movements.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No inventory movements yet.
      </div>
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">Inventory activity</h3>
          <p className="text-sm text-muted-foreground">
            Showing {paginatedMovements.length} of {movements.length} movements.
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
      </div>

      {/* MOBILE */}
      <div className="space-y-2 md:hidden">
        {paginatedMovements.map((movement) => {
          const date = new Date(movement.createdAt).toLocaleString()
          const isReplenish = movement.type === "REPLENISHMENT"
          const isDecrement = movement.quantity < 0

          return (
            <div
              key={movement.id}
              className="flex flex-col gap-1 rounded-md border p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{movement.inventoryItem.name}</p>
                <span className="text-xs text-muted-foreground">{date}</span>
              </div>

              <p className="text-sm text-muted-foreground">
                {movement.type} · {movement.inventoryItem.unit}
              </p>

              <div className="flex items-center gap-2 text-sm">
                <span
                  className={
                    isReplenish
                      ? "text-green-600"
                      : isDecrement
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }
                >
                  {movement.quantity > 0 ? "+" : ""}
                  {movement.quantity}
                </span>

                <span>
                  ({movement.previousStock} → {movement.newStock})
                </span>
              </div>

              {movement.createdByUser && (
                <p className="text-xs text-muted-foreground">
                  By {movement.createdByUser.name}
                </p>
              )}

              {movement.notes && (
                <p className="text-xs italic text-muted-foreground">
                  {movement.notes}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedMovements.map((movement) => {
              const date = new Date(movement.createdAt).toLocaleString()
              const isReplenish = movement.type === "REPLENISHMENT"
              const isDecrement = movement.quantity < 0

              return (
                <TableRow key={movement.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {date}
                  </TableCell>

                  <TableCell className="font-medium">
                    {movement.inventoryItem.name}
                  </TableCell>

                  <TableCell>{movement.type}</TableCell>

                  <TableCell>
                    <span
                      className={
                        isReplenish
                          ? "font-medium text-green-600"
                          : isDecrement
                          ? "font-medium text-red-600"
                          : "text-muted-foreground"
                      }
                    >
                      {movement.quantity > 0 ? "+" : ""}
                      {movement.quantity} {movement.inventoryItem.unit}
                    </span>
                  </TableCell>

                  <TableCell>
                    {movement.previousStock} → {movement.newStock}
                  </TableCell>

                  <TableCell>
                    {movement.createdByUser?.name ?? "-"}
                  </TableCell>

                  <TableCell className="max-w-60 truncate">
                    {movement.notes ?? "-"}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => setPage((currentPage) => currentPage - 1)}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={() => setPage((currentPage) => currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </section>
  )
}

export default InventoryMovementLog