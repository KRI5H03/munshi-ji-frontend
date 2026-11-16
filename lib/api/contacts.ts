import { api } from "@/lib/api/client";
import type { Contact } from "@/lib/types";

/** GET /api/contacts: A to Z, at most 50. `search` matches name or city. */
export async function listContacts(search: string, signal?: AbortSignal): Promise<Contact[]> {
  const res = await api<{ contacts: Contact[] }>("/contacts", { query: { search: search || undefined }, signal });
  return res.contacts;
}

export function canBeBilled(contact: Contact): boolean {
  return contact.contactType === "customer" || contact.contactType === "both";
}
