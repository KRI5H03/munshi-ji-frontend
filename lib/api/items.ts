import { api } from "@/lib/api/client";
import type { Item } from "@/lib/types";

/** GET /api/items: A to Z by description, at most 50. `search` matches description or design no. */
export async function listItems(search: string, signal?: AbortSignal): Promise<Item[]> {
  const res = await api<{ items: Item[] }>("/items", { query: { search: search || undefined }, signal });
  return res.items;
}

/** The API returns at most this many items per list. */
export const ITEMS_LIMIT = 50;

export async function getItem(id: string, signal?: AbortSignal): Promise<Item> {
  const res = await api<{ item: Item }>(`/items/${encodeURIComponent(id)}`, { signal });
  return res.item;
}

export type ItemBody = { description: string; hsnCode: string; designNo: string; unit: string };

/** Opening stock is given only here; after that stock moves only through bills. */
export async function createItem(body: ItemBody & { openingStock: number }): Promise<Item> {
  const res = await api<{ item: Item }>("/items", { method: "POST", body });
  return res.item;
}

/** PATCH sends only what changed. Stock cannot be edited. */
export async function updateItem(id: string, body: Partial<ItemBody>): Promise<Item> {
  const res = await api<{ item: Item }>(`/items/${encodeURIComponent(id)}`, { method: "PATCH", body });
  return res.item;
}

/** Soft delete: old bills keep their copy of the item's details. */
export function deleteItem(id: string): Promise<void> {
  return api<void>(`/items/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/**
 * POST /api/items/:id/adjust: add (positive) or remove (negative) stock by hand, with a note.
 * Fails with 409 INSUFFICIENT_STOCK when stock would go below 0.
 */
export async function adjustStock(id: string, body: { change: number; note: string }): Promise<Item> {
  const res = await api<{ item: Item }>(`/items/${encodeURIComponent(id)}/adjust`, { method: "POST", body });
  return res.item;
}
