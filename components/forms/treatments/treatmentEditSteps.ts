export type TreatmentEditStepId =
  | "details"
  | "inventory"

export const TREATMENT_EDIT_STEPS: Array<{
  id: TreatmentEditStepId
  title: string
  description: string
}> = [
  {
    id: "details",
    title: "Details",
    description: "Treatment configuration",
  },
  {
    id: "inventory",
    title: "Requirements",
    description: "Inventory dependencies",
  },
]