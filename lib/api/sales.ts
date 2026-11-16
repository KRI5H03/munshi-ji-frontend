import { api } from "@/lib/api/client";
import type { Invoice, SaleDetail, SaleRow } from "@/lib/types";

/** GET /api/sales: newest first, at most 100. `search` matches customer name or bill number. */
export async function listSales(search: string, signal?: AbortSignal): Promise<SaleRow[]> {
  const res = await api<{ sales: SaleRow[] }>("/sales", { query: { search: search || undefined }, signal });
  return res.sales;
}

/** The API returns at most this many bills per list. */
export const SALES_LIMIT = 100;

/** Body of POST /api/sales. Money in paise, discounts in milli-percent. */
export type CreateSaleBody = {
  date: string;
  billedToContactId: string;
  shippedToContactId?: string;
  lines: { itemId: string; qty: number; rate: number }[];
  discounts: number[];
  grRrNo?: string;
  transport?: string;
  vehicleNo?: string;
  station?: string;
};

export async function createSale(body: CreateSaleBody): Promise<Invoice> {
  const res = await api<{ invoice: Invoice }>("/sales", { method: "POST", body });
  return res.invoice;
}

/** GET /api/sales/:id: everything needed to show or print one bill. */
export function getSale(id: string, signal?: AbortSignal): Promise<SaleDetail> {
  return api<SaleDetail>(`/sales/${encodeURIComponent(id)}`, { signal });
}

/**
 * POST /api/sales/:id/cancel (owner only). The bill keeps its number and stays in the list as
 * cancelled; stock goes back and the customer's ledger gets a matching credit.
 */
export async function cancelSale(id: string, reason: string): Promise<Invoice> {
  const res = await api<{ invoice: Invoice }>(`/sales/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    body: { reason },
  });
  return res.invoice;
}
