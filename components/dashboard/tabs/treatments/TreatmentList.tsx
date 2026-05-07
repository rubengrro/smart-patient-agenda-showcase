"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpAZ,
  ArrowUpWideNarrow,
  Stethoscope,
} from "lucide-react"

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
import { StaffSpecialty } from "@/lib/generated/prisma/enums"
import { EditTreatmentDialog } from "./EditTreatmentDialog"

interface Treatment {
  id: string
  name: string
  description: string | null
  baseDurationMin: number
  bufferMin: number
  requiredSpecialty: StaffSpecialty | null
  active: boolean
}

interface TreatmentsResponse {
  treatments: Treatment[]
}

type AvailabilityFilter = "active" | "inactive" | "all"
type SpecialtyFilter = "all" | StaffSpecialty | "NONE"
type ActiveSort = "name" | "duration"
type SortDirection = "asc" | "desc"

const fetcher = async (url: string): Promise<TreatmentsResponse> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Failed to fetch treatments.")
  }

  return response.json()
}

function getSpecialtyLabel(specialty: StaffSpecialty | null) {
  if (!specialty) return "General"
  return specialty.replaceAll("_", " ")
}

export default function TreatmentList() {
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("active")
  const [specialtyFilter, setSpecialtyFilter] =
    useState<SpecialtyFilter>("all")
  const [activeSort, setActiveSort] = useState<ActiveSort>("name")
  const [nameSortDirection, setNameSortDirection] =
    useState<SortDirection>("asc")
  const [durationSortDirection, setDurationSortDirection] =
    useState<SortDirection>("asc")

  const { data, error, isLoading } = useSWR<TreatmentsResponse>(
    "/api/treatments",
    fetcher
  )

  const treatments = useMemo(() => {
    return data?.treatments ?? []
  }, [data?.treatments])

  const specialtyOptions = useMemo(() => {
    return Array.from(
      new Set(
        treatments
          .map((treatment) => treatment.requiredSpecialty)
          .filter(Boolean)
      )
    ).sort() as StaffSpecialty[]
  }, [treatments])

  const filteredTreatments = useMemo(() => {
    return treatments
      .filter((treatment) => {
        if (availabilityFilter === "active") return treatment.active
        if (availabilityFilter === "inactive") return !treatment.active
        return true
      })
      .filter((treatment) => {
        if (specialtyFilter === "all") return true
        if (specialtyFilter === "NONE") return treatment.requiredSpecialty === null
        return treatment.requiredSpecialty === specialtyFilter
      })
      .sort((a, b) => {
        if (activeSort === "duration") {
          const result = a.baseDurationMin - b.baseDurationMin
          return durationSortDirection === "asc" ? result : -result
        }

        const result = a.name.localeCompare(b.name)
        return nameSortDirection === "asc" ? result : -result
      })
  }, [
    treatments,
    availabilityFilter,
    specialtyFilter,
    activeSort,
    nameSortDirection,
    durationSortDirection,
  ])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Treatment directory</CardTitle>
          <CardDescription>Loading treatments...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Treatment directory</CardTitle>
          <CardDescription className="text-destructive">
            Could not load treatments.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (treatments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No treatments yet</CardTitle>
          <CardDescription>
            Create your first treatment to start configuring scheduling rules.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Treatment directory</CardTitle>
        <CardDescription>
          Showing {filteredTreatments.length} of {treatments.length} treatments.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mobile controls */}
        <div className="grid w-full gap-3 md:hidden">
          <select
            value={specialtyFilter}
            onChange={(event) =>
              setSpecialtyFilter(event.target.value as SpecialtyFilter)
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">All specialties</option>
            <option value="NONE">General</option>
            {specialtyOptions.map((specialty) => (
              <option key={specialty} value={specialty}>
                {getSpecialtyLabel(specialty)}
              </option>
            ))}
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
            <option value="all">All treatments</option>
          </select>

          <Button
            type="button"
            variant="outline"
            size="sm"
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
            size="sm"
            className="h-10 w-full justify-center"
            onClick={() => {
              setActiveSort("duration")
              setDurationSortDirection((current) =>
                current === "asc" ? "desc" : "asc"
              )
            }}
          >
            {durationSortDirection === "asc" ? (
              <ArrowDownWideNarrow className="mr-2 h-4 w-4" />
            ) : (
              <ArrowUpWideNarrow className="mr-2 h-4 w-4" />
            )}
            {durationSortDirection === "asc"
              ? "Duration low-high"
              : "Duration high-low"}
          </Button>
        </div>

        {/* Mobile cards */}
        <div className="grid gap-4 md:hidden">
          {filteredTreatments.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm font-medium">No treatments found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing the filters or create a new treatment.
              </p>
            </div>
          ) : (
            filteredTreatments.map((treatment) => (
              <Card key={treatment.id}>
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Stethoscope className="h-4 w-4" />
                        {treatment.name}
                      </CardTitle>

                      {treatment.description && (
                        <CardDescription>
                          {treatment.description}
                        </CardDescription>
                      )}
                    </div>

                    <EditTreatmentDialog treatment={treatment} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {treatment.baseDurationMin} min + {treatment.bufferMin} buffer
                    </Badge>

                    <Badge variant="secondary">
                      {getSpecialtyLabel(treatment.requiredSpecialty)}
                    </Badge>

                    <Badge variant={treatment.active ? "default" : "secondary"}>
                      {treatment.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))
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
                    Treatment
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
                      setActiveSort("duration")
                      setDurationSortDirection((current) =>
                        current === "asc" ? "desc" : "asc"
                      )
                    }}
                  >
                    Duration
                    {durationSortDirection === "asc" ? (
                      <ArrowDownWideNarrow className="ml-2 h-4 w-4" />
                    ) : (
                      <ArrowUpWideNarrow className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>

                <TableHead>
                  <Select
                    value={specialtyFilter}
                    onValueChange={(value) =>
                      setSpecialtyFilter(value as SpecialtyFilter)
                    }
                  >
                    <SelectTrigger className="h-8 w-45 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
                      <SelectValue placeholder="Specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All specialties</SelectItem>
                      <SelectItem value="NONE">General</SelectItem>
                      {specialtyOptions.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {getSpecialtyLabel(specialty)}
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
                    <SelectTrigger className="h-8 w-32.5 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
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
              {filteredTreatments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
                      <p className="text-sm font-medium">No treatments found</p>
                      <p className="text-sm text-muted-foreground">
                        Try changing the filters or create a new treatment.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTreatments.map((treatment) => (
                  <TableRow key={treatment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted/30">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div>
                          <p>{treatment.name}</p>
                          {treatment.description && (
                            <p className="text-xs text-muted-foreground">
                              {treatment.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {treatment.baseDurationMin} min + {treatment.bufferMin} buffer
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary">
                        {getSpecialtyLabel(treatment.requiredSpecialty)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={treatment.active ? "default" : "secondary"}>
                        {treatment.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <EditTreatmentDialog treatment={treatment} />
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