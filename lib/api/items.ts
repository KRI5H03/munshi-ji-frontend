import { api } from "@/lib/api/client";
import type { Item } from "@/lib/types";

/** GET /api/items: A to Z by description, at most 50. `search` matches description or design no. */
export async function listItems(search: string, signal?: AbortSignal): Promise<Item[]> {
  const res = await api<{ items: Item[] }>("/items", { query: { search: search || undefined }, signal });
  return res.items;
}
