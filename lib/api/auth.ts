import { api } from "@/lib/api/client";
import type { LoginInput } from "@/lib/schemas/auth";
import type { LoginResponse } from "@/lib/types";

export function login(body: LoginInput): Promise<LoginResponse> {
  return api<LoginResponse>("/auth/login", { method: "POST", body, access: "none" });
}

/** Checks the stored token is still good. */
export function me(signal?: AbortSignal): Promise<{ userId: string }> {
  return api<{ userId: string }>("/auth/me", { access: "user", signal });
}
