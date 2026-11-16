import { stockLevel } from "@/lib/stock";
import { cn } from "@/lib/utils";

/** Stock with its unit; low and out-of-stock are called out in words, not only colour. */
export function StockText({ qty, unit, className }: { qty: number; unit: string; className?: string }) {
  const level = stockLevel(qty);
  return (
    <span className={cn("num inline-flex flex-wrap items-baseline justify-end gap-x-2", className)}>
      <span className={cn("font-bold", level === "out" && "text-destructive")}>
        {qty} {unit.toLowerCase()}
      </span>
      {level === "out" && <span className="text-sm font-semibold text-destructive">Out of stock</span>}
      {level === "low" && <span className="text-sm font-semibold text-amber-800">Low</span>}
    </span>
  );
}
