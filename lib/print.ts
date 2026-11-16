import type { InvoiceLine, TaxRow } from "@/lib/types";

/** The three copies of a tax invoice, one per printed page. */
export const COPIES = ["Original Copy", "Duplicate Copy", "Triplicate Copy"] as const;

export type RateRow = { gstRateBp: number; taxable: number; cgst: number; sgst: number; igst: number };

/** The API gives one tax row per HSN and rate; the printed bill shows one row per rate. */
export function groupTaxByRate(rows: TaxRow[]): RateRow[] {
  const byRate = new Map<number, RateRow>();
  for (const row of rows) {
    const sum = byRate.get(row.gstRateBp) ?? { gstRateBp: row.gstRateBp, taxable: 0, cgst: 0, sgst: 0, igst: 0 };
    sum.taxable += row.taxable;
    sum.cgst += row.cgst;
    sum.sgst += row.sgst;
    sum.igst += row.igst;
    byRate.set(row.gstRateBp, sum);
  }
  return [...byRate.values()].sort((a, b) => a.gstRateBp - b.gstRateBp);
}

/** "PCS" -> "Pcs." as Busy prints it. */
export function formatUnit(unit: string): string {
  const clean = unit.replace(/\.$/, "");
  return clean ? `${clean[0].toUpperCase()}${clean.slice(1).toLowerCase()}.` : "";
}

/** Whole pieces printed with two decimals: 84 -> "84.00". */
export function formatQty(qty: number): string {
  return `${qty}.00`;
}

/** "84.00 Pcs." next to the grand total. The unit is left out when the lines mix units. */
export function totalQuantity(lines: InvoiceLine[]): string {
  const total = lines.reduce((sum, line) => sum + line.qty, 0);
  const units = new Set(lines.map((line) => line.unit.toUpperCase()));
  const unit = units.size === 1 ? ` ${formatUnit(lines[0].unit)}` : "";
  return `${formatQty(total)}${unit}`;
}
