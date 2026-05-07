"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { ArrowDownAZ, ArrowUpAZ, DoorOpen, Wrench } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { ModuleStatus } from "@/lib/generated/prisma/enums"
import { EditModuleDialog } from "./EditModuleDialog"

interface ClinicModule {
  id: string
  name: string
  type: string
  status: ModuleStatus
  active: boolean
}

interface ModulesResponse {
  modules: ClinicModule[]
}

type AvailabilityFilter = "active" | "inactive" | "all"
type StatusFilter = "all" | ModuleStatus
type SortDirection = "asc" | "desc"

const fetcher = async (url: string): Promise<ModulesResponse> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch modules.")
  }

  return response.json()
}

function getStatusLabel(status: ModuleStatus) {
  if (status === ModuleStatus.AVAILABLE) return "Available"
  if (status === ModuleStatus.MAINTENANCE) return "Maintenance"
  return "Out of service"
}

function getStatusVariant(status: ModuleStatus) {
  if (status === ModuleStatus.AVAILABLE) return "default"
  if (status === ModuleStatus.MAINTENANCE) return "secondary"
  return "destructive"
}

export function ModuleList() {
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("active")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const { data, error, isLoading } = useSWR<ModulesResponse>(
    "/api/modules",
    fetcher
  )

  const modules = useMemo(() => {
    return data?.modules ?? []
  }, [data?.modules])

  const moduleTypes = useMemo(() => {
    return Array.from(
      new Set(modules.map((clinicModule) => clinicModule.type).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b))
  }, [modules])

  const filteredModules = useMemo(() => {
    return modules
      .filter((clinicModule) => {
        if (availabilityFilter === "active") return clinicModule.active
        if (availabilityFilter === "inactive") return !clinicModule.active
        return true
      })
      .filter((clinicModule) => {
        if (statusFilter === "all") return true
        return clinicModule.status === statusFilter
      })
      .filter((clinicModule) => {
        if (typeFilter === "all") return true
        return clinicModule.type === typeFilter
      })
      .sort((a, b) => {
        const result = a.name.localeCompare(b.name)
        return sortDirection === "asc" ? result : -result
      })
  }, [modules, availabilityFilter, statusFilter, typeFilter, sortDirection])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Module directory</CardTitle>
          <CardDescription>Loading modules...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Module directory</CardTitle>
          <CardDescription className="text-destructive">
            Could not load modules.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (modules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No modules yet</CardTitle>
          <CardDescription>
            Create your first dental unit or room to start configuring
            appointment resources.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Module directory</CardTitle>
            <CardDescription>
              Showing {filteredModules.length} of {modules.length} modules.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* MOBILE FILTERS */}
      <div className="grid w-full gap-3 md:hidden">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full h-10 justify-between">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {moduleTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-full h-10 justify-between">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.values(ModuleStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={availabilityFilter}
          onValueChange={(value) =>
            setAvailabilityFilter(value as AvailabilityFilter)
          }
        >
          <SelectTrigger className="w-full h-10 justify-between">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent position="popper"
            side="bottom"
            align="start"
            className="w-(--radix-select-trigger-width)">
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="inactive">Inactive only</SelectItem>
            <SelectItem value="all">All modules</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="w-full justify-center"
          size="sm"
          onClick={() =>
            setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
          }
        >
          {sortDirection === "asc" ? (
            <ArrowDownAZ className="mr-2 h-4 w-4" />
          ) : (
            <ArrowUpAZ className="mr-2 h-4 w-4" />
          )}
          {sortDirection === "asc" ? "Name A-Z" : "Name Z-A"}
        </Button>
      </div>

      <CardContent className="space-y-4">
        <div className="grid gap-4 md:hidden">
          {filteredModules.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm font-medium">No modules found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing the filters or create a new module.
              </p>
            </div>
          ) : (
            filteredModules.map((clinicModule) => (
              <Card key={clinicModule.id}>
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <DoorOpen className="h-4 w-4" />
                        {clinicModule.name}
                      </CardTitle>
                      <CardDescription>{clinicModule.type}</CardDescription>
                    </div>

                    <EditModuleDialog module={clinicModule} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={getStatusVariant(clinicModule.status)}
                      className="gap-1"
                    >
                      <Wrench className="h-3 w-3" />
                      {getStatusLabel(clinicModule.status)}
                    </Badge>

                    <Badge
                      variant={clinicModule.active ? "outline" : "secondary"}
                    >
                      {clinicModule.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

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
                    onClick={() =>
                      setSortDirection((current) =>
                        current === "asc" ? "desc" : "asc"
                      )
                    }
                  >
                    Module
                    {sortDirection === "asc" ? (
                      <ArrowDownAZ className="ml-2 h-4 w-4" />
                    ) : (
                      <ArrowUpAZ className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>

                <TableHead>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-8 w-45 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {moduleTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableHead>

                <TableHead>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                  >
                    <SelectTrigger className="h-8 w-40 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      {Object.values(ModuleStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {getStatusLabel(status)}
                        </SelectItem>
                      ))}
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
                    <SelectTrigger className="h-8 w-36.25 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
                      <SelectValue placeholder="Active" />
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
              {filteredModules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
                      <p className="text-sm font-medium">No modules found</p>
                      <p className="text-sm text-muted-foreground">
                        Try changing the filters or create a new module.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredModules.map((clinicModule) => (
                  <TableRow key={clinicModule.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted/30">
                          <DoorOpen className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span>{clinicModule.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {clinicModule.type}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={getStatusVariant(clinicModule.status)}
                        className="gap-1"
                      >
                        <Wrench className="h-3 w-3" />
                        {getStatusLabel(clinicModule.status)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={clinicModule.active ? "outline" : "secondary"}>
                        {clinicModule.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <EditModuleDialog module={clinicModule} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}