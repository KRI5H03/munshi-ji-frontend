import { api } from "@/lib/api/client";
import type { Contact, ContactType } from "@/lib/types";

/** GET /api/contacts: A to Z, at most 50. `search` matches name or city. */
export async function listContacts(search: string, signal?: AbortSignal): Promise<Contact[]> {
  const res = await api<{ contacts: Contact[] }>("/contacts", { query: { search: search || undefined }, signal });
  return res.contacts;
}

/** The API returns at most this many parties per list. */
export const CONTACTS_LIMIT = 50;

export function canBeBilled(contact: Contact): boolean {
  return contact.contactType === "customer" || contact.contactType === "both";
}

export async function getContact(id: string, signal?: AbortSignal): Promise<Contact> {
  const res = await api<{ contact: Contact }>(`/contacts/${encodeURIComponent(id)}`, { signal });
  return res.contact;
}

/** Body of POST /api/contacts. Give a GSTIN, or a state code, or both (they must match). */
export type ContactBody = {
  name: string;
  contactType: ContactType;
  city: string;
  address?: string;
  gstin?: string;
  stateCode?: string;
  pan?: string;
  aadhaar?: string;
  phone?: string;
};

/** Note: this route returns the contact itself, not wrapped in { contact } like every other route. */
export function createContact(body: ContactBody): Promise<Contact> {
  return api<Contact>("/contacts", { method: "POST", body });
}

/** PATCH sends only what changed; a field cannot be cleared back to empty yet. */
export async function updateContact(id: string, body: Partial<ContactBody>): Promise<Contact> {
  const res = await api<{ contact: Contact }>(`/contacts/${encodeURIComponent(id)}`, { method: "PATCH", body });
  return res.contact;
}

/** Soft delete: old bills keep their copy of the party's details. */
export function deleteContact(id: string): Promise<void> {
  return api<void>(`/contacts/${encodeURIComponent(id)}`, { method: "DELETE" });
}
