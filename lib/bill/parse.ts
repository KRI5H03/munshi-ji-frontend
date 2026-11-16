// Turns what was typed into the API's integers. Strings are split on the decimal point;
// no floating-point maths touches a saved value.

/** "850" -> 85000, "850.5" -> 85050, "1,250.75" -> 125075. Null when it is not an amount. */
export function parseRupees(input: string): number | null {
  const text = input.trim().replace(/,/g, "");
  const match = /^(\d{1,9})(?:\.(\d{0,2}))?$/.exec(text);
  if (!match) return null;
  const paise = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(paise) ? paise : null;
}

/** "10" -> 10000, "4.762" -> 4762 (milli-percent). Null when not 0 to 100 with up to 3 decimals. */
export function parsePercent(input: string): number | null {
  const match = /^(\d{1,3})(?:\.(\d{0,3}))?$/.exec(input.trim());
  if (!match) return null;
  const milli = Number(match[1]) * 1000 + Number((match[2] ?? "").padEnd(3, "0"));
  return milli <= 100000 ? milli : null;
}

/** Whole pieces: "10" -> 10. Null when not a whole number. */
export function parseQty(input: string): number | null {
  const text = input.trim();
  if (!/^\d{1,7}$/.test(text)) return null;
  return Number(text);
}

/** 85000 -> "850", 85050 -> "850.50": a paise value shown back in a rate field. */
export function paiseToInput(paise: number): string {
  const rupees = Math.trunc(paise / 100);
  const rest = paise % 100;
  return rest === 0 ? String(rupees) : `${rupees}.${String(rest).padStart(2, "0")}`;
}
