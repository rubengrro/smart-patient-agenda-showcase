import CreateStaffDialog from "./staff/CreateStaffDialog"
import StaffList from "./staff/StaffList"

export default function StaffTab() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Staff</h2>
          <p className="text-sm text-muted-foreground">
            Manage clinic collaborators and platform access.
          </p>
        </div>

        <CreateStaffDialog />
      </div>

      <StaffList />
    </section>
  )
}