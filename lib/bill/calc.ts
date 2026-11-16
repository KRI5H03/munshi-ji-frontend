// Live preview of a bill, the same integer maths as the backend's src/core (bill.ts, discount.ts,
// tax.ts, money.ts). Everything is whole paise; no floats. The saved bill always shows the server's figures.
import { gstRateBp } from "@/lib/bill/gst-rules";

/** Half rounds up, as the backend's divideRoundHalf. Inputs are whole and non-negative. */
function divideRoundHalf(numerator: number, denominator: number): number {
  const rem = numerator % denominator;
  const quotient = (numerator - rem) / denominator;
  return rem * 2 >= denominator ? quotient + 1 : quotient;
}

export function applyPercentMilli(amount: number, percentMilli: number): number {
  return divideRoundHalf(amount * percentMilli, 100000);
}

export function applyBasisPoints(amount: number, bp: number): number {
  return divideRoundHalf(amount * bp, 10000);
}

export function roundToRupee(paise: number): { total: number; roundOff: number } {
  const total = divideRoundHalf(paise, 100) * 100;
  return { total, roundOff: total - paise };
}

/** Each discount applies to what is left after the one before. */
export function stackedDiscounts(gross: number, percentMillis: number[]) {
  const steps: { seq: number; percentMilli: number; amount: number }[] = [];
  let remaining = gross;
  percentMillis.forEach((percentMilli, i) => {
    const amount = applyPercentMilli(remaining, percentMilli);
    steps.push({ seq: i + 1, percentMilli, amount });
    remaining -= amount;
  });
  return { steps, discountTotal: gross - remaining };
}

/** Splits the bill discount across lines by their gross; leftover paise go to the biggest remainders. */
export function apportionDiscount(lineGrosses: number[], discountTotal: number): number[] {
  const totalGross = lineGrosses.reduce((sum, g) => sum + g, 0);
  if (discountTotal === 0 || totalGross === 0) return lineGrosses.map(() => 0);
  const shares: number[] = [];
  const leftovers: { index: number; rem: number }[] = [];
  let given = 0;
  lineGrosses.forEach((gross, index) => {
    const product = discountTotal * gross;
    const rem = product % totalGross;
    const whole = (product - rem) / totalGross;
    shares.push(whole);
    leftovers.push({ index, rem });
    given += whole;
  });
  leftovers.sort((a, b) => b.rem - a.rem || a.index - b.index);
  for (const { index } of leftovers.slice(0, discountTotal - given)) shares[index] += 1;
  return shares;
}

/** Taxable value of one piece, rounded up, as the backend's perPieceCeil. */
export function perPieceCeil(taxable: number, qty: number): number {
  const rem = taxable % qty;
  const whole = (taxable - rem) / qty;
  return rem > 0 ? whole + 1 : whole;
}

export type PreviewLine = { qty: number; rate: number; hsnCode: string };

export type RateRow = { gstRateBp: number; taxable: number; cgst: number; sgst: number; igst: number };

export type BillPreview = {
  gross: number;
  discounts: { seq: number; percentMilli: number; amount: number }[];
  discountTotal: number;
  taxable: number;
  /** One row per GST rate, for the totals panel. */
  rates: RateRow[];
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  grandTotal: number;
  /** Rate decided for each line, in the same order. */
  lineRates: number[];
};

/** Null when the date has no GST rule (then only the server can say). Lines must have qty >= 1. */
export function previewBill(
  lines: PreviewLine[],
  percentMillis: number[],
  date: string,
  interState: boolean,
): BillPreview | null {
  const grosses = lines.map((l) => l.qty * l.rate);
  const gross = grosses.reduce((sum, g) => sum + g, 0);
  const { steps, discountTotal } = stackedDiscounts(gross, percentMillis);
  const allocs = apportionDiscount(grosses, discountTotal);

  const lineRates: number[] = [];
  // Tax is worked out per HSN and rate, as on the bill's tax table, then added up.
  const groups = new Map<string, { gstRateBp: number; taxable: number }>();
  for (const [i, line] of lines.entries()) {
    const taxable = grosses[i] - allocs[i];
    const rate = gstRateBp(perPieceCeil(taxable, line.qty), date);
    if (rate === null) return null;
    lineRates.push(rate);
    const key = `${line.hsnCode}|${rate}`;
    const group = groups.get(key) ?? { gstRateBp: rate, taxable: 0 };
    group.taxable += taxable;
    groups.set(key, group);
  }

  const byRate = new Map<number, RateRow>();
  for (const g of groups.values()) {
    const row = byRate.get(g.gstRateBp) ?? { gstRateBp: g.gstRateBp, taxable: 0, cgst: 0, sgst: 0, igst: 0 };
    row.taxable += g.taxable;
    if (interState) {
      row.igst += applyBasisPoints(g.taxable, g.gstRateBp);
    } else {
      const half = applyBasisPoints(g.taxable, g.gstRateBp / 2);
      row.cgst += half;
      row.sgst += half;
    }
    byRate.set(g.gstRateBp, row);
  }
  const rates = [...byRate.values()].sort((a, b) => a.gstRateBp - b.gstRateBp);
  const sum = (pick: (r: RateRow) => number) => rates.reduce((total, r) => total + pick(r), 0);
  const taxable = sum((r) => r.taxable);
  const cgst = sum((r) => r.cgst);
  const sgst = sum((r) => r.sgst);
  const igst = sum((r) => r.igst);
  const { total, roundOff } = roundToRupee(taxable + cgst + sgst + igst);

  return { gross, discounts: steps, discountTotal, taxable, rates, cgst, sgst, igst, roundOff, grandTotal: total, lineRates };
}
