import React from "react"
import PatientList from "./patients/PatientList"
import { CreatePatientDialog } from "./patients/CreatePatientDialog"

const PatientsTab = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Patients</h2>
          <p className="text-sm text-muted-foreground">
            Manage patient contact information for scheduling purposes.
          </p>
        </div>

        <CreatePatientDialog />
      </div>

      <PatientList />
    </div>
  )
}

export default PatientsTab