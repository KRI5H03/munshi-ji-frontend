import { z } from "zod";
import type { ContactBody } from "@/lib/api/contacts";
import { STATES } from "@/lib/states";
import type { Contact, ContactType } from "@/lib/types";

// The customer form, checked with the same rules as POST/PATCH /api/contacts in docs/API.md.

export const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PAN_PATTERN = /^[A-Z]{5}\d{4}[A-Z]$/;

export type ContactFormValues = {
  name: string;
  contactType: ContactType;
  city: string;
  address: string;
  gstin: string;
  stateCode: string;
  pan: string;
  aadhaar: string;
  phone: string;
};

export const CONTACT_FIELDS = [
  "name",
  "contactType",
  "city",
  "address",
  "gstin",
  "stateCode",
  "pan",
  "aadhaar",
  "phone",
] as const satisfies readonly (keyof ContactFormValues)[];

/** The state a GSTIN belongs to, when it is a valid GSTIN with a known state. */
export function stateFromGstin(gstin: string): string | null {
  const clean = gstin.trim().toUpperCase();
  if (!GSTIN_PATTERN.test(clean)) return null;
  const code = clean.slice(0, 2);
  return STATES[code] ? code : null;
}

/**
 * `saved` is the party as stored, when editing. The API cannot empty a field once it has a value,
 * so emptying one is caught here with a plain message instead of being silently ignored.
 */
export function contactSchema(saved?: Contact) {
  const keepFilled = (field: keyof Contact, label: string) => (value: string, ctx: z.RefinementCtx) => {
    if (saved && saved[field] && !value.trim()) {
      ctx.addIssue({ code: "custom", message: `${label} cannot be emptied once saved` });
    }
  };

  return z
    .object({
      name: z.string().trim().min(1, "Enter the name").max(200, "At most 200 characters"),
      contactType: z.enum(["customer", "supplier", "both"]),
      city: z.string().trim().min(1, "Enter the city").max(100, "At most 100 characters"),
      address: z.string().trim().max(500, "At most 500 characters").superRefine(keepFilled("address", "Address")),
      gstin: z
        .string()
        .trim()
        .toUpperCase()
        .refine((v) => !v || GSTIN_PATTERN.test(v), "A GSTIN has 15 characters, like 09ABCDE1234F1Z5")
        .refine((v) => !v || STATES[v.slice(0, 2)], "The first two digits are not a state code")
        .superRefine(keepFilled("gstin", "GSTIN")),
      stateCode: z.string(),
      pan: z
        .string()
        .trim()
        .toUpperCase()
        .refine((v) => !v || PAN_PATTERN.test(v), "A PAN looks like ABCDE1234F")
        .superRefine(keepFilled("pan", "PAN")),
      aadhaar: z
        .string()
        .trim()
        .refine((v) => !v || /^\d{12}$/.test(v.replace(/\s/g, "")), "Aadhaar is 12 digits"),
      phone: z
        .string()
        .trim()
        .refine((v) => !v || /^\d{10}$/.test(v.replace(/\s/g, "")), "Phone is 10 digits, like 9876543210")
        .superRefine(keepFilled("phone", "Phone")),
    })
    .superRefine((v, ctx) => {
      if (!v.gstin && !STATES[v.stateCode]) {
        ctx.addIssue({ code: "custom", path: ["stateCode"], message: "Choose the state, or enter a GSTIN" });
      }
    });
}

export function contactDefaults(contact?: Contact): ContactFormValues {
  return {
    name: contact?.name ?? "",
    contactType: contact?.contactType ?? "customer",
    city: contact?.city ?? "",
    address: contact?.address ?? "",
    gstin: contact?.gstin ?? "",
    stateCode: contact?.stateCode ?? "",
    pan: contact?.pan ?? "",
    // The API returns the Aadhaar number only in stored form; it is never shown back.
    aadhaar: "",
    phone: contact?.phone ?? "",
  };
}

/** Values that passed contactSchema, as the API wants them. Empty optional fields are left out. */
export function toContactBody(v: ContactFormValues): ContactBody {
  const opt = (s: string) => s.trim() || undefined;
  const gstin = opt(v.gstin)?.toUpperCase();
  return {
    name: v.name.trim(),
    contactType: v.contactType,
    city: v.city.trim(),
    address: opt(v.address),
    gstin,
    // With a GSTIN the server takes the state from it; sending both only invites a mismatch.
    stateCode: gstin ? undefined : v.stateCode,
    pan: opt(v.pan)?.toUpperCase(),
    aadhaar: opt(v.aadhaar.replace(/\s/g, "")),
    phone: opt(v.phone.replace(/\s/g, "")),
  };
}

/** For PATCH: only the fields that differ from what is saved. */
export function changedFields(body: ContactBody, saved: Contact): Partial<ContactBody> {
  const changes: Partial<ContactBody> = {};
  const set = <K extends keyof ContactBody>(key: K, value: ContactBody[K]) => {
    changes[key] = value;
  };
  if (body.name !== saved.name) set("name", body.name);
  if (body.contactType !== saved.contactType) set("contactType", body.contactType);
  if (body.city !== saved.city) set("city", body.city);
  if (body.address !== undefined && body.address !== saved.address) set("address", body.address);
  if (body.gstin !== undefined && body.gstin !== saved.gstin) set("gstin", body.gstin);
  if (!body.gstin && body.stateCode !== undefined && body.stateCode !== saved.stateCode) set("stateCode", body.stateCode);
  if (body.pan !== undefined && body.pan !== saved.pan) set("pan", body.pan);
  if (body.aadhaar !== undefined) set("aadhaar", body.aadhaar);
  if (body.phone !== undefined && body.phone !== saved.phone) set("phone", body.phone);
  return changes;
}

export const CONTACT_TYPES: { value: ContactType; label: string }[] = [
  { value: "customer", label: "Customer" },
  { value: "supplier", label: "Supplier" },
  { value: "both", label: "Both" },
];

export function contactTypeLabel(type: ContactType): string {
  return CONTACT_TYPES.find((t) => t.value === type)?.label ?? type;
}
