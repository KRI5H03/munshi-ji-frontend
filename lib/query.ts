import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/lib/api/client";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Retrying a 4xx only repeats the same answer; retry once for network and server faults.
        retry: (failures, error) => failures < 1 && !(isApiError(error) && error.status >= 400 && error.status < 500),
      },
      mutations: { retry: false },
    },
  });
}

/** Every firm-scoped key starts with the firm id, so two firms never share cached rows. */
export const keys = {
  me: ["me"] as const,
  firm: (businessId: string) => ["firm", businessId] as const,
  /** Prefix for every bill list of a firm; invalidate this after saving a bill. */
  sales: (businessId: string) => ["firm", businessId, "sales"] as const,
  salesSearch: (businessId: string, search: string) => ["firm", businessId, "sales", { search }] as const,
  /** Prefix for every item list; invalidate after a bill is saved, since stock changes. */
  items: (businessId: string) => ["firm", businessId, "items"] as const,
  itemsSearch: (businessId: string, search: string) => ["firm", businessId, "items", { search }] as const,
  contacts: (businessId: string) => ["firm", businessId, "contacts"] as const,
  contactsSearch: (businessId: string, search: string) => ["firm", businessId, "contacts", { search }] as const,
  profile: (businessId: string) => ["firm", businessId, "profile"] as const,
};
