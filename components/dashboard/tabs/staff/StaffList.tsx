"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { ArrowDownAZ, ArrowUpAZ, UserRound } from "lucide-react"

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
import { StaffRole, StaffSpecialty } from "@/lib/generated/prisma/enums"
import { StaffWithUser } from "@/types/staff"
import EditStaffDialog from "./EditStaffDialog"

type StatusFilter = "active" | "inactive" | "all"
type AccessFilter = "all" | "with-access" | "without-access"
type RoleFilter = "all" | StaffRole
type SpecialtyFilter = "all" | string
type SortDirection = "asc" | "desc"

const fetcher = async (url: string): Promise<StaffWithUser[]> => {
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error("Failed to fetch staff.")
  }

  return res.json()
}

function getSpecialtyLabel(member: StaffWithUser) {
  if (member.specialty === StaffSpecialty.OTHER) {
    return member.customSpecialtyLabel ?? "Other"
  }

  return member.specialty.replaceAll("_", " ")
}

function getSpecialtyFilterValue(member: StaffWithUser) {
  if (member.specialty === StaffSpecialty.OTHER) {
    return member.customSpecialtyLabel ?? "Other"
  }

  return member.specialty
}

export default function StaffList() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active")
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [specialtyFilter, setSpecialtyFilter] =
    useState<SpecialtyFilter>("all")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const { data, error, isLoading } = useSWR<StaffWithUser[]>("/api/staff", fetcher)

  const staff = useMemo(() => {
    return data ?? []
  }, [data])

  const specialtyOptions = useMemo(() => {
    return Array.from(
      new Set(staff.map((member) => getSpecialtyFilterValue(member)).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b))
  }, [staff])

  const filteredStaff = useMemo(() => {
    return staff
      .filter((member) => {
        if (statusFilter === "active") return member.active
        if (statusFilter === "inactive") return !member.active
        return true
      })
      .filter((member) => {
        if (accessFilter === "with-access") return Boolean(member.user)
        if (accessFilter === "without-access") return !member.user
        return true
      })
      .filter((member) => {
        if (roleFilter === "all") return true
        return member.role === roleFilter
      })
      .filter((member) => {
        if (specialtyFilter === "all") return true
        return getSpecialtyFilterValue(member) === specialtyFilter
      })
      .sort((a, b) => {
        const result = a.fullName.localeCompare(b.fullName)
        return sortDirection === "asc" ? result : -result
      })
  }, [staff, statusFilter, accessFilter, roleFilter, specialtyFilter, sortDirection])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff directory</CardTitle>
          <CardDescription>Loading staff members...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff directory</CardTitle>
          <CardDescription className="text-destructive">
            Failed to load staff members.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (staff.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No staff members yet</CardTitle>
          <CardDescription>
            Add your first team member to start assigning treatments and appointments.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Staff directory</CardTitle>
        <CardDescription>
          Showing {filteredStaff.length} of {staff.length} staff members.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mobile filters */}
        <div className="grid w-full gap-3 md:hidden">
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">All roles</option>
            {Object.values(StaffRole).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={specialtyFilter}
            onChange={(event) => setSpecialtyFilter(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">All specialties</option>
            {specialtyOptions.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty.replaceAll("_", " ")}
              </option>
            ))}
          </select>

          <select
            value={accessFilter}
            onChange={(event) => setAccessFilter(event.target.value as AccessFilter)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">All platform access</option>
            <option value="with-access">With access</option>
            <option value="without-access">Without access</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
            <option value="all">All staff</option>
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
          {filteredStaff.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm font-medium">No staff members found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing the filters or add a new staff member.
              </p>
            </div>
          ) : (
            filteredStaff.map((member) => {
              const hasAccess = Boolean(member.user)

              return (
                <Card key={member.id}>
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <UserRound className="h-4 w-4" />
                          {member.fullName}
                        </CardTitle>

                        <CardDescription>
                          {member.role} · {getSpecialtyLabel(member)}
                        </CardDescription>
                      </div>

                      <EditStaffDialog member={member} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant={member.active ? "default" : "secondary"}>
                        {member.active ? "Active" : "Inactive"}
                      </Badge>

                      <Badge variant="secondary">{member.role}</Badge>

                      <Badge variant="outline">
                        {hasAccess ? "Platform access" : "No platform access"}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {hasAccess ? member.user?.email : "No platform email"}
                    </p>
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

                <TableHead>
                  <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger className="h-8 w-45 border bg-background/80 px-3 text-xs text-muted-foreground shadow-none">
                      <SelectValue placeholder="Specialty" />
                    </SelectTrigger>

                    <SelectContent className="border bg-background/95 text-foreground backdrop-blur">
                      <SelectItem
                        className="
                          text-sm
                          focus:bg-muted/50
                          focus:text-foreground
                          data-[state=checked]:bg-muted/40
                          data-[state=checked]:text-foreground
                        "
                        value="all"
                      >
                        All specialties
                      </SelectItem>
                      {specialtyOptions.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty.replaceAll("_", " ")}
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
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
                      <p className="text-sm font-medium">No staff members found</p>
                      <p className="text-sm text-muted-foreground">
                        Try changing the filters or add a new staff member.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted/30">
                          <UserRound className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <span>Dr. {member.fullName}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary">
                        {getSpecialtyLabel(member)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={member.active ? "default" : "secondary"}>
                        {member.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <EditStaffDialog member={member} />
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