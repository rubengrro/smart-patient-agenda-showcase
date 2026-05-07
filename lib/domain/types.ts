export type ID = string

export type ISODate = string 
export type ISODateTime = string 
export type TimeString = string 

export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"

export type ModuleStatus =
  | "available"
  | "maintenance"
  | "out_of_service"

export type InventoryStatus =
  | "healthy"
  | "low"
  | "critical"

export type StaffRole =
  | "admin"
  | "dentist"
  | "assistant"

export type StaffSpecialty =
  | "general"
  | "orthodontics"
  | "surgery"
  | "endodontics"
  | "periodontics"

export interface TimeRange {
  start: TimeString
  end: TimeString
}

export interface WorkingDay {
  day: WeekDay
  ranges: TimeRange[] 
}

export interface Schedule {
  workingDays: WorkingDay[]
}

export interface Patient {
  id: ID
  fullName: string
  phone: string
  email?: string
  notes?: string

  preferredStaffId?: ID

  active: boolean

  createdAt: ISODateTime
}

export interface StaffMember {
  id: ID
  fullName: string

  role: StaffRole
  specialty: StaffSpecialty

  allowedTreatmentIds: ID[]

  durationFactor: number 

  schedule: Schedule

  absentDates?: ISODate[]

  active: boolean

  createdAt: ISODateTime
}

export interface Treatment {
  id: ID
  name: string
  description?: string

  baseDurationMin: number
  bufferMin: number

  requiredSpecialty?: StaffSpecialty

  allowedModuleIds: ID[]

  requiredInventory: TreatmentInventoryRequirement[]

  active: boolean

  createdAt: ISODateTime
}

export interface TreatmentInventoryRequirement {
  inventoryItemId: ID
  quantity: number
}

export interface ClinicModule {
  id: ID
  name: string

  supportedTreatmentIds: ID[]

  schedule: Schedule

  status: ModuleStatus

  active: boolean

  createdAt: ISODateTime
}

export interface InventoryItem {
  id: ID
  name: string

  unit: string 

  stock: number
  minStock: number

  active: boolean

  createdAt: ISODateTime
}

export interface Appointment {
  id: ID

  patientId: ID
  staffId: ID
  moduleId: ID
  treatmentId: ID

  date: ISODate

  startTime: TimeString
  endTime: TimeString

  estimatedDurationMin: number
  actualDurationMin?: number

  status: AppointmentStatus

  notes?: string

  createdAt: ISODateTime
}

export interface AppointmentValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  estimatedDurationMin: number
  calculatedEndTime: TimeString
  suggestedAlternatives?: SuggestedSlot[]
}

export interface SuggestedSlot {
  date: ISODate
  startTime: TimeString

  staffId?: ID
  moduleId?: ID

  reason?: string
}

export interface AvailabilityCheck {
  available: boolean
  reason?: string
}

export interface BottleneckRisk {
  hasRisk: boolean
  level: "low" | "medium" | "high"
  reason: string
}

export interface TimeRangeInMinutes {
  start: number
  end: number
}

export interface ValidateAppointmentCandidateParams {
  treatment: Treatment
  staff: StaffMember
  module: ClinicModule
  date: ISODate
  startTime: TimeString
  appointments: Appointment[]
  inventoryItems: InventoryItem[]
}