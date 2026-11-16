import { useSession } from "@/lib/session";

/**
 * The open firm's id, or null while it is not known yet (first render, logged out, no firm chosen).
 * Firm queries use it in their key and stay disabled while it is null.
 */
export function useFirmId(): string | null {
  return useSession()?.businessId ?? null;
}
