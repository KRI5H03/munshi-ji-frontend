import { describe, expect, it } from "vitest";
import { apportionDiscount, previewBill, roundToRupee, stackedDiscounts } from "@/lib/bill/calc";
import { gstRateBp } from "@/lib/bill/gst-rules";

const KURTA = "62114290";

describe("previewBill matches bills saved by the backend", () => {
  it("bill 1/2026-27: 10 x 850, 10% discount, same state", () => {
    const p = previewBill([{ qty: 10, rate: 85000, hsnCode: KURTA }], [10000], "2026-11-16", false);
    expect(p).toMatchObject({
      gross: 850000,
      discountTotal: 85000,
      taxable: 765000,
      cgst: 19125,
      sgst: 19125,
      igst: 0,
      roundOff: 50,
      grandTotal: 803300,
      lineRates: [500],
    });
  });

  it("bill 2/2026-27: 1 x 850, no discount", () => {
    const p = previewBill([{ qty: 1, rate: 85000, hsnCode: KURTA }], [], "2026-11-16", false);
    expect(p).toMatchObject({ taxable: 85000, cgst: 2125, sgst: 2125, roundOff: 50, grandTotal: 89300 });
  });
});

describe("previewBill rules", () => {
  it("charges IGST only when the customer is in another state", () => {
    const p = previewBill([{ qty: 10, rate: 85000, hsnCode: KURTA }], [10000], "2026-11-16", true);
    expect(p).toMatchObject({ cgst: 0, sgst: 0, igst: 38250, roundOff: 50, grandTotal: 803300 });
  });

  it("uses 18% above 2,500 a piece after discount, 5% at or below", () => {
    const high = previewBill([{ qty: 1, rate: 250100, hsnCode: KURTA }], [], "2026-11-16", false);
    const atLimit = previewBill([{ qty: 1, rate: 250000, hsnCode: KURTA }], [], "2026-11-16", false);
    const discountedDown = previewBill([{ qty: 1, rate: 270000, hsnCode: KURTA }], [10000], "2026-11-16", false);
    expect(high?.lineRates).toEqual([1800]);
    expect(atLimit?.lineRates).toEqual([500]);
    expect(discountedDown?.lineRates).toEqual([500]);
  });

  it("uses the old 12% rule for bills dated before 22 Sep 2025", () => {
    expect(gstRateBp(150000, "2025-09-21")).toBe(1200);
    expect(gstRateBp(150000, "2025-09-22")).toBe(500);
    expect(gstRateBp(150000, "2017-06-30")).toBeNull();
  });

  it("gives one row per rate when lines mix rates", () => {
    const p = previewBill(
      [
        { qty: 2, rate: 85000, hsnCode: KURTA },
        { qty: 1, rate: 300000, hsnCode: KURTA },
        { qty: 3, rate: 40000, hsnCode: "6204" },
      ],
      [],
      "2026-11-16",
      false,
    );
    expect(p?.rates.map((r) => [r.gstRateBp, r.taxable])).toEqual([
      [500, 290000],
      [1800, 300000],
    ]);
  });
});

describe("discount helpers", () => {
  it("stacks two discounts", () => {
    expect(stackedDiscounts(100000, [10000, 4762])).toEqual({
      steps: [
        { seq: 1, percentMilli: 10000, amount: 10000 },
        { seq: 2, percentMilli: 4762, amount: 4286 },
      ],
      discountTotal: 14286,
    });
  });

  it("splits a discount so the shares add up exactly", () => {
    const shares = apportionDiscount([333, 333, 334], 100);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(100);
    expect(shares).toEqual([33, 33, 34]);
  });

  it("rounds to the nearest rupee, half up", () => {
    expect(roundToRupee(803250)).toEqual({ total: 803300, roundOff: 50 });
    expect(roundToRupee(803249)).toEqual({ total: 803200, roundOff: -49 });
  });
});
