import { api } from "@/lib/api/client";
import type { Business } from "@/lib/types";

/** GET /api/businesses/profile: the open firm. */
export async function getProfile(signal?: AbortSignal): Promise<Business> {
  const res = await api<{ business: Business }>("/businesses/profile", { signal });
  return res.business;
}

/** The fields PATCH accepts. GSTIN and state code can never be changed. */
export type ProfileBody = {
  name: string;
  address: string;
  phone: string;
  pan: string;
  msmeUdhyamNo: string;
  branchAddress: string;
  jurisdiction: string;
  bankName: string;
  bankAccountNo: string;
  ifsc: string;
  bankBranch: string;
  termsText: string;
};

/** PATCH /api/businesses/profile (owner only). Send only what changed. */
export async function updateProfile(body: Partial<ProfileBody>): Promise<Business> {
  const res = await api<{ business: Business }>("/businesses/profile", { method: "PATCH", body });
  return res.business;
}
