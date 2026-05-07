import { CreateModuleDialog } from "./modules/CreateModuleDialog"
import { ModuleList } from "./modules/ModuleList"

const ModulesTab = () => {
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Modules</h1>
          <p className="text-sm text-muted-foreground">
            Manage dental units, rooms, and operatories used for appointments.
          </p>
        </div>

        <CreateModuleDialog />
      </div>

      <ModuleList />
    </section>
  )
}

export default ModulesTab