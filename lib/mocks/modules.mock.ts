import type { ClinicModule } from "@/lib/domain/types"

export const modulesMock: ClinicModule[] = [
  {
    id: "module_001",
    name: "Unit 1",
    supportedTreatmentIds: [
      "treatment_001",
      "treatment_003",
      "treatment_005",
    ],
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
    status: "available",
    active: true,
    createdAt: "2026-04-20T04:00:00Z",
  },
  {
    id: "module_002",
    name: "Unit 2",
    supportedTreatmentIds: [
      "treatment_001",
      "treatment_002",
      "treatment_005",
    ],
    schedule: {
      workingDays: [
        {
          day: "monday",
          ranges: [{ start: "09:00", end: "18:00" }],
        },
        {
          day: "tuesday",
          ranges: [{ start: "09:00", end: "18:00" }],
        },
        {
          day: "wednesday",
          ranges: [{ start: "09:00", end: "18:00" }],
        },
        {
          day: "thursday",
          ranges: [{ start: "09:00", end: "18:00" }],
        },
        {
          day: "friday",
          ranges: [{ start: "09:00", end: "16:00" }],
        },
      ],
    },
    status: "available",
    active: true,
    createdAt: "2026-04-20T04:05:00Z",
  },
  {
    id: "module_003",
    name: "Surgery Room",
    supportedTreatmentIds: ["treatment_002", "treatment_004"],
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
        {
          day: "friday",
          ranges: [{ start: "10:00", end: "18:00" }],
        },
      ],
    },
    status: "available",
    active: true,
    createdAt: "2026-04-20T04:10:00Z",
  },
]