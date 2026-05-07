import { z } from "zod"

const inventoryItemBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Item name must be at least 2 characters.")
    .max(80, "Item name must be less than 80 characters."),

  description: z
    .string()
    .trim()
    .max(240, "Description must be less than 240 characters.")
    .optional()
    .or(z.literal("")),

  unit: z
    .string()
    .trim()
    .min(1, "Unit is required.")
    .max(30, "Unit must be less than 30 characters."),

  stock: z.coerce
    .number()
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative."),

  minStock: z.coerce
    .number()
    .int("Minimum stock must be a whole number.")
    .min(0, "Minimum stock cannot be negative."),

  active: z.boolean().default(true),
})

export const createInventoryItemSchema = inventoryItemBaseSchema.refine(
  (data) => data.minStock <= data.stock || data.stock === 0,
  {
    path: ["minStock"],
    message:
      "Minimum stock should not be greater than current stock unless stock is zero.",
  }
)

export const updateInventoryItemSchema = inventoryItemBaseSchema.partial()

export const inventoryStockMovementSchema = z.object({
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .positive("Quantity must be greater than zero."),

  notes: z
    .string()
    .trim()
    .max(240, "Notes must be less than 240 characters.")
    .optional()
    .or(z.literal("")),
})

export type CreateInventoryItemInput = z.input<typeof createInventoryItemSchema>
export type CreateInventoryItemOutput = z.output<typeof createInventoryItemSchema>

export type UpdateInventoryItemInput = z.input<typeof updateInventoryItemSchema>
export type UpdateInventoryItemOutput = z.output<typeof updateInventoryItemSchema>

export type InventoryStockMovementInput = z.input<typeof inventoryStockMovementSchema>
export type InventoryStockMovementOutput = z.output<typeof inventoryStockMovementSchema>