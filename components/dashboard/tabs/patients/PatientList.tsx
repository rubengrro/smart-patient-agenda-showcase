"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { ArrowDownAZ, ArrowUpAZ, UserRound } from "lucide-react"
import { EditPatientDialog } from "./EditPatientDialog"
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
import CopyField from "@/components/ui/CopyField"

interface Patient {
  id: string
  fullName: string
  phone: string
  email: string | null
  dateOfBirth: string | null
  active: boolean
  preferredStaff: {
    id: string
    fullName: string
  } | null
}

type StatusFilter = "active" | "inactive" | "all"
type StaffFilter = "all" | "none" | string
type SortDirection = "asc" | "desc"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return null

  const today = new Date()
  const birthDate = new Date(dateOfBirth)

  let age = today.getFullYear() - birthDate.getFullYear()

  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate())

  if (!hasHadBirthdayThisYear) age--

  return age
}

const PatientList = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active")
  const [staffFilter, setStaffFilter] = useState<StaffFilter>("all")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const { data, error, isLoading } = useSWR("/api/patients", fetcher)

  const patients: Patient[] = useMemo(() => {
    return data?.patients ?? []
  }, [data?.patients])

  const staffOptions = useMemo(() => {
    return Array.from(
      new Map(
        patients
          .filter((patient) => patient.preferredStaff)
          .map((patient) => [
            patient.preferredStaff!.id,
            patient.preferredStaff!,
          ])
      ).values()
    ).sort((a, b) => a.fullName.localeCompare(b.fullName))
  }, [patients])

  const filteredPatients = useMemo(() => {
    return patients
      .filter((patient) => {
        if (statusFilter === "active") return patient.active
        if (statusFilter === "inactive") return !patient.active
        return true
      })
      .filter((patient) => {
        if (staffFilter === "all") return true
        if (staffFilter === "none") return !patient.preferredStaff
        return patient.preferredStaff?.id === staffFilter
      })
      .sort((a, b) => {
        const result = a.fullName.localeCompare(b.fullName)
        return sortDirection === "asc" ? result : -result
      })
  }, [patients, statusFilter, staffFilter, sortDirection])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient directory</CardTitle>
          <CardDescription>Loading patients...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient directory</CardTitle>
          <CardDescription className="text-destructive">
            Failed to load patients.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (patients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No patients registered yet</CardTitle>
          <CardDescription>
            Create your first patient to start scheduling appointments.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Patient directory</CardTitle>
        <CardDescription>
          Showing {filteredPatients.length} of {patients.length} patients.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mobile filters */}
        <div className="grid w-full gap-3 md:hidden">
          <select
            value={staffFilter}
            onChange={(event) => setStaffFilter(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">All preferred staff</option>
            <option value="none">No preferred staff</option>
            {staffOptions.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.fullName}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
            <option value="all">All patients</option>
          </select>

          <Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-center"
            onClick={() =>
              setSortDirection((current) =>
                current === "asc" ? "desc" : "asc"
              )
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

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {filteredPatients.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm font-medium">No patients found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing the filters or create a new patient.
              </p>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const age = calculateAge(patient.dateOfBirth)

              return (
                <Card key={patient.id}>
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <UserRound className="h-4 w-4" />
                          {patient.fullName}
                        </CardTitle>

                        <CardDescription>
                          {patient.phone}
                          {patient.email ? ` · ${patient.email}` : ""}
                        </CardDescription>
                      </div>

                      <EditPatientDialog patient={patient} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {age !== null ? `${age} years old` : "No DOB"}
                      </Badge>

                      <Badge variant="secondary">
                        {patient.preferredStaff?.fullName ?? "No preferred staff"}
                      </Badge>

                      <Badge variant={patient.active ? "default" : "secondary"}>
                        {patient.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
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
            className="h-8 px-0 font-medium hover:bg-transparent"
            onClick={() =>
              setSortDirection((current) =>
                current === "asc" ? "desc" : "asc"
              )
            }
          >
            Name
            {sortDirection === "asc" ? (
              <ArrowDownAZ className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpAZ className="ml-2 h-4 w-4" />
            )}
          </Button>
        </TableHead>

        <TableHead>Phone</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Age</TableHead>

        <TableHead>
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="h-8 w-45 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
              <SelectValue placeholder="Preferred staff" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All preferred staff</SelectItem>
              <SelectItem value="none">No preferred staff</SelectItem>
              {staffOptions.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableHead>

        <TableHead>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as StatusFilter)
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
      {filteredPatients.length === 0 ? (
        <TableRow>
          <TableCell colSpan={7}>
            <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
              <p className="text-sm font-medium">No patients found</p>
              <p className="text-sm text-muted-foreground">
                Try changing the filters or create a new patient.
              </p>
            </div>
          </TableCell>
        </TableRow>
      ) : (
        filteredPatients.map((patient) => {
          const age = calculateAge(patient.dateOfBirth)

          return (
            <TableRow key={patient.id} className="hover:bg-muted/30">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted/30">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <span>{patient.fullName}</span>
                </div>
              </TableCell>

              <TableCell>
                <CopyField value={patient.phone} />
              </TableCell>

              <TableCell>
                <CopyField value={patient.email} fallback="-" />
              </TableCell>

              <TableCell>{age !== null ? age : "-"}</TableCell>

              <TableCell>
                {patient.preferredStaff?.fullName ?? "-"}
              </TableCell>

              <TableCell>
                <Badge variant={patient.active ? "default" : "secondary"}>
                  {patient.active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <EditPatientDialog patient={patient} />
              </TableCell>
            </TableRow>
          )
        })
      )}
    </TableBody>
  </Table>
</div>
      </CardContent>
    </Card>
  )
}

export default PatientList