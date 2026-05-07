import type { StaffMember } from "@/lib/domain/types"

export const staffMock: StaffMember[] = [
  {
    id: "staff_001",
    fullName: "Dr. Valeria Herrera",
    role: "dentist",
    specialty: "general",
    allowedTreatmentIds: ["treatment_001", "treatment_005"],
    durationFactor: 1,
    schedule: {
      workingDays: [
        {
          day: "monday",
          ranges: [{ start: "09:00", end: "17:00" }],
        },
        {
          day: "tuesday",
          ranges: [{ start: "09:00", end: "17:00" }],
        },
        {
          day: "wednesday",
          ranges: [{ start: "09:00", end: "17:00" }],
        },
        {
          day: "thursday",
          ranges: [{ start: "09:00", end: "17:00" }],
        },
        {
          day: "friday",
          ranges: [{ start: "09:00", end: "15:00" }],
        },
      ],
    },
    absentDates: [],
    active: true,
    createdAt: "2026-04-20T05:00:00Z",
  },
  {
    id: "staff_002",
    fullName: "Dr. Ricardo Ruiz",
    role: "dentist",
    specialty: "surgery",
    allowedTreatmentIds: ["treatment_002", "treatment_005"],
    durationFactor: 1.2,
    schedule: {
      workingDays: [
        {
          day: "monday",
          ranges: [{ start: "10:00", end: "18:00" }],
        },
        {
          day: "tuesday",
          ranges: [{ start: "10:00", end: "18:00" }],
        },
        {
          day: "thursday",
          ranges: [{ start: "10:00", end: "18:00" }],
        },
      ],
    },
    absentDates: ["2026-04-23"],
    active: true,
    createdAt: "2026-04-20T05:05:00Z",
  },
  {
    id: "staff_003",
    fullName: "Dra. Fernanda Campos",
    role: "dentist",
    specialty: "orthodontics",
    allowedTreatmentIds: ["treatment_003"],
    durationFactor: 0.9,
    schedule: {
      workingDays: [
        {
          day: "monday",
          ranges: [{ start: "09:00", end: "14:00" }],
        },
        {
          day: "wednesday",
          ranges: [{ start: "09:00", end: "14:00" }],
        },
        {
          day: "friday",
          ranges: [{ start: "09:00", end: "14:00" }],
        },
      ],
    },
    absentDates: [],
    active: true,
    createdAt: "2026-04-20T05:10:00Z",
  },
  {
    id: "staff_004",
    fullName: "Dr. Eduardo Salas",
    role: "dentist",
    specialty: "endodontics",
    allowedTreatmentIds: ["treatment_004"],
    durationFactor: 1.1,
    schedule: {
      workingDays: [
        {
          day: "tuesday",
          ranges: [{ start: "11:00", end: "18:00" }],
        },
        {
          day: "thursday",
          ranges: [{ start: "11:00", end: "18:00" }],
        },
        {
          day: "friday",
          ranges: [{ start: "11:00", end: "18:00" }],
        },
      ],
    },
    absentDates: [],
    active: true,
    createdAt: "2026-04-20T05:15:00Z",
  },
]