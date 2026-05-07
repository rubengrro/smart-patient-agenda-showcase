"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpAZ,
  ArrowUpWideNarrow,
  Package,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EditInventoryItemDialog } from "./EditInventoryItemDialog"
import { ReplenishInventoryItemDialog } from "./ReplenishInventoryItemDialog"

interface InventoryItem {
  id: string
  name: string
  description: string | null
  unit: string
  stock: number
  minStock: number
  active: boolean
}

interface InventoryListProps {
  inventoryEnabled: boolean
}

type AvailabilityFilter = "active" | "inactive" | "all"
type AlertFilter = "all" | "low-stock" | "healthy"
type UnitFilter = "all" | string
type ActiveSort = "name" | "stock"
type SortDirection = "asc" | "desc"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const InventoryList = ({ inventoryEnabled }: InventoryListProps) => {
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("active")
  const [alertFilter, setAlertFilter] = useState<AlertFilter>("all")
  const [unitFilter, setUnitFilter] = useState<UnitFilter>("all")
  const [activeSort, setActiveSort] = useState<ActiveSort>("name")
  const [nameSortDirection, setNameSortDirection] =
    useState<SortDirection>("asc")
  const [stockSortDirection, setStockSortDirection] =
    useState<SortDirection>("asc")

  const { data, error, isLoading } = useSWR("/api/inventory", fetcher)

  const items = useMemo<InventoryItem[]>(() => {
    return data?.items ?? []
  }, [data?.items])

  const unitOptions = useMemo(() => {
    return Array.from(
      new Set(items.map((item) => item.unit).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b))
  }, [items])

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (availabilityFilter === "active") return item.active
        if (availabilityFilter === "inactive") return !item.active
        return true
      })
      .filter((item) => {
        if (unitFilter === "all") return true
        return item.unit === unitFilter
      })
      .filter((item) => {
        const isLowStock = item.stock <= item.minStock

        if (alertFilter === "low-stock") return isLowStock
        if (alertFilter === "healthy") return !isLowStock
        return true
      })
      .sort((a, b) => {
        if (activeSort === "stock") {
          const result = a.stock - b.stock
          return stockSortDirection === "asc" ? result : -result
        }

        const result = a.name.localeCompare(b.name)
        return nameSortDirection === "asc" ? result : -result
      })
  }, [
    items,
    availabilityFilter,
    unitFilter,
    alertFilter,
    activeSort,
    nameSortDirection,
    stockSortDirection,
  ])

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading inventory...</div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load inventory.
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm font-medium">No inventory items yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first item to start tracking clinical supplies.
        </p>
      </div>
    )
  }

  return (
    <section className="space-y-4">
      {/* Mobile controls */}
      <div className="grid w-full gap-3 md:hidden">
        <select
          value={unitFilter}
          onChange={(event) => setUnitFilter(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="all">All units</option>
          {unitOptions.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        <select
          value={alertFilter}
          onChange={(event) => setAlertFilter(event.target.value as AlertFilter)}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="all">All alerts</option>
          <option value="low-stock">Low stock</option>
          <option value="healthy">Healthy</option>
        </select>

        <select
          value={availabilityFilter}
          onChange={(event) =>
            setAvailabilityFilter(event.target.value as AvailabilityFilter)
          }
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
          <option value="all">All items</option>
        </select>

        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-center"
          onClick={() => {
            setActiveSort("name")
            setNameSortDirection((current) =>
              current === "asc" ? "desc" : "asc"
            )
          }}
        >
          {nameSortDirection === "asc" ? (
            <ArrowDownAZ className="mr-2 h-4 w-4" />
          ) : (
            <ArrowUpAZ className="mr-2 h-4 w-4" />
          )}
          {nameSortDirection === "asc" ? "Name A-Z" : "Name Z-A"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-center"
          onClick={() => {
            setActiveSort("stock")
            setStockSortDirection((current) =>
              current === "asc" ? "desc" : "asc"
            )
          }}
        >
          {stockSortDirection === "asc" ? (
            <ArrowDownWideNarrow className="mr-2 h-4 w-4" />
          ) : (
            <ArrowUpWideNarrow className="mr-2 h-4 w-4" />
          )}
          {stockSortDirection === "asc"
            ? "Stock low-high"
            : "Stock high-low"}
        </Button>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-4 md:hidden">
        {filteredItems.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm font-medium">No inventory items found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing the filters or add a new item.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isLowStock = item.stock <= item.minStock

            return (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 font-medium">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {item.name}
                    </p>

                    {item.description && (
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground">
                      {item.stock} {item.unit} · minimum {item.minStock}
                    </p>
                  </div>

                  <Badge variant={item.active ? "default" : "secondary"}>
                    {item.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {inventoryEnabled && isLowStock && (
                    <Badge variant="destructive">Low stock</Badge>
                  )}

                  {!isLowStock && <Badge variant="outline">Healthy</Badge>}

                  <ReplenishInventoryItemDialog
                    item={item}
                    disabled={!inventoryEnabled || !item.active}
                  />

                  <EditInventoryItemDialog
                    item={item}
                    disabled={!inventoryEnabled}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-0 font-medium"
                  onClick={() => {
                    setActiveSort("name")
                    setNameSortDirection((current) =>
                      current === "asc" ? "desc" : "asc"
                    )
                  }}
                >
                  Item
                  {nameSortDirection === "asc" ? (
                    <ArrowDownAZ className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowUpAZ className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>

              <TableHead>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-0 font-medium"
                  onClick={() => {
                    setActiveSort("stock")
                    setStockSortDirection((current) =>
                      current === "asc" ? "desc" : "asc"
                    )
                  }}
                >
                  Stock
                  {stockSortDirection === "asc" ? (
                    <ArrowDownWideNarrow className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowUpWideNarrow className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>

              <TableHead>
                <Select value={unitFilter} onValueChange={setUnitFilter}>
                  <SelectTrigger className="h-8 w-45 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All units</SelectItem>
                    {unitOptions.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>

              <TableHead>
                <Select
                  value={alertFilter}
                  onValueChange={(value) =>
                    setAlertFilter(value as AlertFilter)
                  }
                >
                  <SelectTrigger className="h-8 w-32.5 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
                    <SelectValue placeholder="Alert" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All alerts</SelectItem>
                    <SelectItem value="low-stock">Low stock</SelectItem>
                    <SelectItem value="healthy">Healthy</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>

              <TableHead>
                <Select
                  value={availabilityFilter}
                  onValueChange={(value) =>
                    setAvailabilityFilter(value as AvailabilityFilter)
                  }
                >
                  <SelectTrigger className="h-8 w-45 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </TableHead>

              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
                    <p className="text-sm font-medium">
                      No inventory items found
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Try changing the filters or add a new item.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const isLowStock = item.stock <= item.minStock

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted/30">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div>
                          <p>{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {item.stock} {item.unit}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {item.unit}
                      </span>
                    </TableCell>

                    <TableCell>
                      {inventoryEnabled && isLowStock ? (
                        <Badge variant="destructive">Low stock</Badge>
                      ) : (
                        <Badge variant="outline">Healthy</Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant={item.active ? "default" : "secondary"}>
                        {item.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ReplenishInventoryItemDialog
                          item={item}
                          disabled={!inventoryEnabled || !item.active}
                        />

                        <EditInventoryItemDialog
                          item={item}
                          disabled={!inventoryEnabled}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

export default InventoryList