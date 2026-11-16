// Copy of the backend's src/config/gstRules.ts, used only for the live preview on New bill.
// The saved bill always uses the server's rate. Keep the two files the same.

export type GstRule = {
  effectiveFrom: string;
  effectiveTo: string | null;
  /** Taxable value per piece above this (in paise) takes the high rate. */
  thresholdPaise: number;
  lowBp: number;
  highBp: number;
};

// GST rates for apparel (HSN chapters 61, 62).
export const GST_RULES: GstRule[] = [
  { effectiveFrom: "2017-07-01", effectiveTo: "2025-09-21", thresholdPaise: 100000, lowBp: 500, highBp: 1200 },
  { effectiveFrom: "2025-09-22", effectiveTo: null, thresholdPaise: 250000, lowBp: 500, highBp: 1800 },
];

/** The rate for one piece worth `valuePerPiece` paise on `date`, or null when no rule covers the date. */
export function gstRateBp(valuePerPiece: number, date: string): number | null {
  const rule = GST_RULES.find((r) => r.effectiveFrom <= date && (r.effectiveTo === null || r.effectiveTo >= date));
  if (!rule) return null;
  return valuePerPiece > rule.thresholdPaise ? rule.highBp : rule.lowBp;
}
