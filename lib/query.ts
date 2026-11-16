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
};
