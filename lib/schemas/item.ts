import { z } from "zod";
import type { ItemBody } from "@/lib/api/items";
import type { Item } from "@/lib/types";

// The item form, checked with the same rules as POST/PATCH /api/items in docs/API.md.

export type ItemFormValues = {
  description: string;
  designNo: string;
  hsnCode: string;
  unit: string;
  /** Only used when adding. */
  openingStock: string;
};

export const ITEM_FIELDS = ["description", "designNo", "hsnCode", "unit", "openingStock"] as const satisfies readonly (keyof ItemFormValues)[];

/** Common units, offered as suggestions. Any unit up to 10 letters can be typed. */
export const UNIT_SUGGESTIONS = ["PCS", "SET", "PAIR", "DOZ", "MTR", "KG", "BOX"];

export const itemSchema = z.object({
  description: z.string().trim().min(1, "Enter the item name").max(200, "At most 200 characters"),
  designNo: z.string().trim().min(1, "Enter the design no.").max(50, "At most 50 characters"),
  hsnCode: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, "HSN code is 4 to 8 digits, like 62114290"),
  unit: z.string().trim().min(1, "Enter the unit, like PCS").max(10, "At most 10 letters"),
  openingStock: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{1,7}$/.test(v), "Whole pieces only, like 40")
    .refine((v) => v === "" || Number(v) <= 1_000_000, "At most 10,00,000"),
});

export function itemDefaults(item?: Item): ItemFormValues {
  return {
    description: item?.description ?? "",
    designNo: item?.designNo ?? "",
    hsnCode: item?.hsnCode ?? "",
    unit: item?.unit ?? "PCS",
    openingStock: "",
  };
}

export function toItemBody(v: ItemFormValues): ItemBody {
  return {
    description: v.description.trim(),
    designNo: v.designNo.trim(),
    hsnCode: v.hsnCode.trim(),
    unit: v.unit.trim().toUpperCase(),
  };
}

export function openingStock(v: ItemFormValues): number {
  return v.openingStock.trim() ? Number(v.openingStock.trim()) : 0;
}

/** For PATCH: only the fields that differ from what is saved. */
export function changedItemFields(body: ItemBody, saved: Item): Partial<ItemBody> {
  const changes: Partial<ItemBody> = {};
  for (const key of ["description", "designNo", "hsnCode", "unit"] as const) {
    if (body[key] !== saved[key]) changes[key] = body[key];
  }
  return changes;
}
