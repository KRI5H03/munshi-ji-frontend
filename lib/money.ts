// Display helpers. Everything here works on integers; no floats touch money.

/** 803300 -> "8,033.00" (Indian grouping: last three digits, then pairs). */
export function formatPaise(paise: number): string {
  const abs = Math.abs(paise);
  const rupees = Math.trunc(abs / 100).toString();
  const fraction = (abs % 100).toString().padStart(2, "0");
  const lastThree = rupees.slice(-3);
  const rest = rupees.slice(0, -3);
  const grouped = rest
    ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}`
    : lastThree;
  return `${paise < 0 ? "−" : ""}${grouped}.${fraction}`;
}

/** 803300 -> "₹8,033.00" */
export function formatRupees(paise: number): string {
  const text = formatPaise(paise);
  return text.startsWith("−") ? `−₹${text.slice(1)}` : `₹${text}`;
}

/** Round off always shows its sign: 50 -> "+0.50", -16 -> "−0.16". */
export function formatSigned(paise: number): string {
  return paise >= 0 ? `+${formatPaise(paise)}` : formatPaise(paise);
}

function trimDecimal(whole: number, fraction: string): string {
  const trimmed = fraction.replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : `${whole}`;
}

/** Milli-percent: 10000 -> "10%", 4762 -> "4.762%". */
export function formatPercentMilli(milli: number): string {
  return `${trimDecimal(Math.trunc(milli / 1000), (milli % 1000).toString().padStart(3, "0"))}%`;
}

/** Basis points: 500 -> "5%", 250 -> "2.5%". */
export function formatBp(bp: number): string {
  return `${trimDecimal(Math.trunc(bp / 100), (bp % 100).toString().padStart(2, "0"))}%`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-16" -> "16 Nov 2026" */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

/** "2026-11-16" -> "16-11-2026" (as printed on the bill) */
export function formatDateNumeric(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}-${month}-${year}`;
}

/** "9876543210" -> "98765 43210" */
export function formatPhone(phone: string): string {
  return `${phone.slice(0, 5)} ${phone.slice(5)}`;
}

/** Today on this device as "YYYY-MM-DD", the same form bills are dated in. */
export function todayIso(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
