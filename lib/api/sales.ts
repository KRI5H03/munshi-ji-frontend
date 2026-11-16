import { api } from "@/lib/api/client";
import type { SaleRow } from "@/lib/types";

/** GET /api/sales: newest first, at most 100. `search` matches customer name or bill number. */
export async function listSales(search: string, signal?: AbortSignal): Promise<SaleRow[]> {
  const res = await api<{ sales: SaleRow[] }>("/sales", { query: { search: search || undefined }, signal });
  return res.sales;
}

/** The API returns at most this many bills per list. */
export const SALES_LIMIT = 100;
