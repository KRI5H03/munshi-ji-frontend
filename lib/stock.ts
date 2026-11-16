/** Frontend-only rule (not in the API): stock at or below this is called low. */
export const LOW_STOCK_AT = 10;

export type StockLevel = "out" | "low" | "ok";

export function stockLevel(qty: number): StockLevel {
  if (qty <= 0) return "out";
  return qty <= LOW_STOCK_AT ? "low" : "ok";
}
