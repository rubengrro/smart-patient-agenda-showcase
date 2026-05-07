export type OnboardingStepId = "clinic" | "module"

export interface OnboardingFormValues {
    clinicName: string 
    firstModuleName: string 
    firstModuleType?: string 
}

export interface OnboardingStepItem {
    id: OnboardingStepId
    title: string 
    description: string
}