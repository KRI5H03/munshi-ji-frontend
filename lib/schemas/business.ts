import { z } from "zod";
import type { ProfileBody } from "@/lib/api/business";
import type { Business } from "@/lib/types";

// Firm settings, checked with the same rules as PATCH /api/businesses/profile in docs/API.md.

export type ProfileFormValues = ProfileBody;

export const PROFILE_FIELDS = [
  "name",
  "address",
  "phone",
  "pan",
  "msmeUdhyamNo",
  "branchAddress",
  "jurisdiction",
  "bankName",
  "bankAccountNo",
  "ifsc",
  "bankBranch",
  "termsText",
] as const satisfies readonly (keyof ProfileFormValues)[];

/** Fields the API checks for a format; once saved they cannot be emptied (an empty value fails the check). */
const FORMATTED: (keyof ProfileFormValues)[] = ["phone", "pan", "bankAccountNo", "ifsc"];

const digits = (v: string) => v.replace(/\s/g, "");

export function profileSchema(saved: Business) {
  const optionalFormat = (key: keyof ProfileFormValues, label: string, test: (v: string) => boolean, message: string) =>
    z.string().superRefine((value, ctx) => {
      const v = value.trim();
      if (!v) {
        if (saved[key]) ctx.addIssue({ code: "custom", message: `${label} cannot be emptied once saved` });
        return;
      }
      if (!test(v)) ctx.addIssue({ code: "custom", message });
    });

  return z.object({
    name: z.string().trim().min(1, "Enter the firm name").max(200, "At most 200 characters"),
    address: z.string().trim().min(1, "Enter the shop address").max(500, "At most 500 characters"),
    phone: optionalFormat("phone", "Phone", (v) => /^\d{10}$/.test(digits(v)), "Phone is 10 digits, like 9876543210"),
    pan: optionalFormat("pan", "PAN", (v) => /^[A-Z]{5}\d{4}[A-Z]$/.test(v.toUpperCase()), "A PAN looks like ABCDE1234F"),
    msmeUdhyamNo: z.string().trim().max(30, "At most 30 characters"),
    branchAddress: z.string().trim().max(500, "At most 500 characters"),
    jurisdiction: z.string().trim().max(100, "At most 100 characters"),
    bankName: z.string().trim().max(100, "At most 100 characters"),
    bankAccountNo: optionalFormat(
      "bankAccountNo",
      "Account no.",
      (v) => /^\d{9,18}$/.test(digits(v)),
      "Account no. is 9 to 18 digits",
    ),
    ifsc: optionalFormat(
      "ifsc",
      "IFSC",
      (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.toUpperCase()),
      "An IFSC looks like SBIN0001234",
    ),
    bankBranch: z.string().trim().max(100, "At most 100 characters"),
    termsText: z.string().trim().max(2000, "At most 2,000 characters"),
  });
}

export function profileDefaults(b: Business): ProfileFormValues {
  return {
    name: b.name,
    address: b.address,
    phone: b.phone ?? "",
    pan: b.pan ?? "",
    msmeUdhyamNo: b.msmeUdhyamNo ?? "",
    branchAddress: b.branchAddress ?? "",
    jurisdiction: b.jurisdiction ?? "",
    bankName: b.bankName ?? "",
    bankAccountNo: b.bankAccountNo ?? "",
    ifsc: b.ifsc ?? "",
    bankBranch: b.bankBranch ?? "",
    termsText: b.termsText ?? "",
  };
}

/** Values as the API stores them: trimmed, capitals where it uppercases, digits without spaces. */
function clean(v: ProfileFormValues): ProfileFormValues {
  return {
    name: v.name.trim(),
    address: v.address.trim(),
    phone: digits(v.phone),
    pan: v.pan.trim().toUpperCase(),
    msmeUdhyamNo: v.msmeUdhyamNo.trim().toUpperCase(),
    branchAddress: v.branchAddress.trim(),
    jurisdiction: v.jurisdiction.trim(),
    bankName: v.bankName.trim(),
    bankAccountNo: digits(v.bankAccountNo),
    ifsc: v.ifsc.trim().toUpperCase(),
    bankBranch: v.bankBranch.trim(),
    termsText: v.termsText.trim(),
  };
}

/** For PATCH: only what differs from what is saved. Empty formatted fields are never sent (they could not be saved). */
export function changedProfileFields(values: ProfileFormValues, saved: Business): Partial<ProfileBody> {
  const now = clean(values);
  const before = profileDefaults(saved);
  const changes: Partial<ProfileBody> = {};
  for (const key of PROFILE_FIELDS) {
    if (now[key] === before[key]) continue;
    if (!now[key] && FORMATTED.includes(key)) continue;
    changes[key] = now[key];
  }
  return changes;
}
