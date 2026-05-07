import type { Treatment } from "@/lib/domain/types"

export const treatmentsMock: Treatment[] = [
  {
    id: "treatment_001",
    name: "Dental Cleaning",
    description: "Routine prophylaxis and oral evaluation.",
    baseDurationMin: 30,
    bufferMin: 10,
    allowedModuleIds: ["module_001", "module_002"],
    requiredInventory: [
      {
        inventoryItemId: "inventory_001",
        quantity: 1,
      },
    ],
    active: true,
    createdAt: "2026-04-20T06:00:00Z",
  },
  {
    id: "treatment_002",
    name: "Tooth Extraction",
    description: "Simple extraction with anesthesia and post-op instructions.",
    baseDurationMin: 40,
    bufferMin: 20,
    requiredSpecialty: "surgery",
    allowedModuleIds: ["module_002", "module_003"],
    requiredInventory: [
      {
        inventoryItemId: "inventory_001",
        quantity: 1,
      },
      {
        inventoryItemId: "inventory_002",
        quantity: 1,
      },
    ],
    active: true,
    createdAt: "2026-04-20T06:05:00Z",
  },
  {
    id: "treatment_003",
    name: "Braces Adjustment",
    description: "Periodic orthodontic adjustment.",
    baseDurationMin: 25,
    bufferMin: 10,
    requiredSpecialty: "orthodontics",
    allowedModuleIds: ["module_001"],
    requiredInventory: [
      {
        inventoryItemId: "inventory_005",
        quantity: 1,
      },
    ],
    active: true,
    createdAt: "2026-04-20T06:10:00Z",
  },
  {
    id: "treatment_004",
    name: "Root Canal",
    description: "Endodontic treatment for infected tooth pulp.",
    baseDurationMin: 60,
    bufferMin: 20,
    requiredSpecialty: "endodontics",
    allowedModuleIds: ["module_003"],
    requiredInventory: [
      {
        inventoryItemId: "inventory_001",
        quantity: 1,
      },
      {
        inventoryItemId: "inventory_003",
        quantity: 1,
      },
      {
        inventoryItemId: "inventory_004",
        quantity: 1,
      },
    ],
    active: true,
    createdAt: "2026-04-20T06:15:00Z",
  },
  {
    id: "treatment_005",
    name: "Composite Filling",
    description: "Restoration using composite resin.",
    baseDurationMin: 35,
    bufferMin: 10,
    allowedModuleIds: ["module_001", "module_002"],
    requiredInventory: [
      {
        inventoryItemId: "inventory_001",
        quantity: 1,
      },
      {
        inventoryItemId: "inventory_006",
        quantity: 1,
      },
    ],
    active: true,
    createdAt: "2026-04-20T06:20:00Z",
  },
]