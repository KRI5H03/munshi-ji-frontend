import { z } from "zod";
import type { CreateSaleBody } from "@/lib/api/sales";
import { parsePercent, parseQty, parseRupees } from "@/lib/bill/parse";
import type { Contact, Item } from "@/lib/types";

// The New bill form, checked with the same limits as POST /api/sales in docs/API.md.
// Fields hold what was typed (strings); toCreateSaleBody turns them into paise and milli-percent.

export const MAX_LINES = 50;
const MAX_QTY = 100_000;
const MAX_RATE = 100_000_000; // paise per piece (₹10,00,000)

export type BillLineValues = { key: string; item: Item; qty: string; rate: string };

export type BillFormValues = {
  date: string;
  billedTo: Contact | null;
  shippedTo: Contact | null;
  lines: BillLineValues[];
  discounts: [string, string];
  grRrNo: string;
  transport: string;
  vehicleNo: string;
  station: string;
};

export function qtyProblem(text: string): string | null {
  if (!text.trim()) return "Enter pieces";
  const qty = parseQty(text);
  if (qty === null) return "Pieces must be a whole number";
  if (qty < 1) return "At least 1 piece";
  if (qty > MAX_QTY) return "At most 1,00,000 pieces";
  return null;
}

export function rateProblem(text: string): string | null {
  if (!text.trim()) return "Enter the rate";
  const rate = parseRupees(text);
  if (rate === null) return "Rate like 850 or 850.50";
  if (rate > MAX_RATE) return "At most ₹10,00,000 a piece";
  return null;
}

export function discountProblem(text: string): string | null {
  if (!text.trim()) return null;
  return parsePercent(text) === null ? "A percent from 0 to 100, like 10 or 4.762" : null;
}

const fieldCheck = (problem: (text: string) => string | null) =>
  z.string().superRefine((text, ctx) => {
    const message = problem(text);
    if (message) ctx.addIssue({ code: "custom", message });
  });

const line = z.object({
  key: z.string(),
  item: z.custom<Item>(),
  qty: fieldCheck(qtyProblem),
  rate: fieldCheck(rateProblem),
});

export const billSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the bill date"),
    billedTo: z.custom<Contact | null>().refine((c) => c !== null, "Choose a customer"),
    shippedTo: z.custom<Contact | null>(),
    lines: z.array(line).min(1, "Add at least one item").max(MAX_LINES, `A bill can have at most ${MAX_LINES} items`),
    discounts: z.tuple([fieldCheck(discountProblem), fieldCheck(discountProblem)]),
    grRrNo: z.string().trim().max(50, "At most 50 characters"),
    transport: z.string().trim().max(100, "At most 100 characters"),
    vehicleNo: z.string().trim().max(20, "At most 20 characters"),
    station: z.string().trim().max(100, "At most 100 characters"),
  })
  .superRefine((bill, ctx) => {
    if (!bill.discounts[0].trim() && bill.discounts[1].trim()) {
      ctx.addIssue({ code: "custom", path: ["discounts", 0], message: "Fill discount 1 first" });
    }
    // The server refuses a bill that sells more than is in stock; say so before saving.
    for (const problem of stockProblems(bill.lines)) {
      ctx.addIssue({ code: "custom", path: ["lines", problem.index, "qty"], message: problem.message });
    }
  });

/** Pieces of each item across all lines, checked against its stock. Reported on the item's last line. */
export function stockProblems(lines: BillLineValues[]): { index: number; message: string }[] {
  const wanted = new Map<string, { item: Item; qty: number; last: number }>();
  lines.forEach((l, index) => {
    const qty = parseQty(l.qty) ?? 0;
    const entry = wanted.get(l.item.id) ?? { item: l.item, qty: 0, last: index };
    entry.qty += qty;
    entry.last = index;
    wanted.set(l.item.id, entry);
  });
  return [...wanted.values()]
    .filter((w) => w.qty > w.item.stockQty)
    .map((w) => ({ index: w.last, message: `Only ${w.item.stockQty} left of ${w.item.designNo}` }));
}

/** Call only with values that passed billSchema. */
export function toCreateSaleBody(values: BillFormValues): CreateSaleBody {
  const text = (value: string) => value.trim() || undefined;
  return {
    date: values.date,
    billedToContactId: values.billedTo!.id,
    shippedToContactId: values.shippedTo?.id,
    lines: values.lines.map((l) => ({ itemId: l.item.id, qty: parseQty(l.qty)!, rate: parseRupees(l.rate)! })),
    discounts: values.discounts.filter((d) => d.trim()).map((d) => parsePercent(d)!),
    grRrNo: text(values.grRrNo),
    transport: text(values.transport),
    vehicleNo: text(values.vehicleNo)?.toUpperCase(),
    station: text(values.station),
  };
}

/** The API's field path (like "lines.0.qty") as a form field. */
export function billFieldFor(apiField: string): string | undefined {
  if (apiField === "billedToContactId") return "billedTo";
  if (apiField === "shippedToContactId") return "shippedTo";
  if (/^lines\.\d+\.(qty|rate)$/.test(apiField)) return apiField;
  if (/^lines\.\d+\.itemId$/.test(apiField)) return apiField.replace(/itemId$/, "qty");
  if (apiField === "lines") return "lines";
  if (/^discounts\.[01]$/.test(apiField)) return apiField;
  if (apiField === "discounts") return "discounts.0";
  if (["date", "grRrNo", "transport", "vehicleNo", "station"].includes(apiField)) return apiField;
  return undefined;
}
