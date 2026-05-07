import AgendaTab from "@/components/dashboard/tabs/AgendaTab"
// import HomeTab from "@/components/dashboard/tabs/HomeTab"
import InventoryTab from "@/components/dashboard/tabs/InventoryTab"
import ModulesTab from "@/components/dashboard/tabs/ModulesTab"
import PatientsTab from "@/components/dashboard/tabs/PatientsTab"
// import ReportsTab from "@/components/dashboard/tabs/ReportsTab"
import SettingsTab from "@/components/dashboard/tabs/settings/SettingsTab"
import StaffTab from "@/components/dashboard/tabs/StaffTab"
import TreatmentsTab from "@/components/dashboard/tabs/TreatmentsTab"
import type { ComponentType } from "react"



export type DashboardTabId =
  | "home"
  | "agenda"
  | "patients"
  | "treatments"
  | "staff"
  | "modules"
  | "inventory"
  | "reports"
  | "settings"

export interface DashboardTabItem {
  id: DashboardTabId
  label: string
  component: ComponentType
}

export const DASHBOARD_TABS: DashboardTabItem[] = [
  // {
  //   id: "home",
  //   label: "Home",
  //   component: HomeTab,
  // },
  {
    id: "agenda",
    label: "Agenda",
    component: AgendaTab,
  },
  {
    id: "patients",
    label: "Patients",
    component: PatientsTab,
  },
  {
    id: "treatments",
    label: "Treatments",
    component: TreatmentsTab,
  },
  {
    id: "staff",
    label: "Staff",
    component: StaffTab,
  },
  {
    id: "modules",
    label: "Modules",
    component: ModulesTab,
  },
  {
    id: "inventory",
    label: "Inventory",
    component: InventoryTab,
  },
  // {
  //   id: "reports",
  //   label: "Reports",
  //   component: ReportsTab,
  // },
  {
    id: "settings",
    label: "Schedule",
    component: SettingsTab
  }
]