import { api } from "@/lib/api/client";
import type { Business } from "@/lib/types";

/** GET /api/businesses/profile: the open firm. */
export async function getProfile(signal?: AbortSignal): Promise<Business> {
  const res = await api<{ business: Business }>("/businesses/profile", { signal });
  return res.business;
}
