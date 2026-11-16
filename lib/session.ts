// Who is logged in and which firm is open. Kept in localStorage so a refresh keeps you in.
// The token identifies the user only; the firm is sent per request as X-Business-Id.
import { useSyncExternalStore } from "react";
import { z } from "zod";
import type { LoginBusiness, LoginResponse } from "@/lib/types";

const sessionSchema = z.object({
  token: z.string().min(1),
  userId: z.string(),
  businesses: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      role: z.enum(["owner", "staff"]),
      isDefault: z.boolean(),
    }),
  ),
  businessId: z.string().nullable(),
});

export type Session = z.infer<typeof sessionSchema>;

const KEY = "munshi-ji.session";
const listeners = new Set<() => void>();

// useSyncExternalStore needs the same object back while nothing has changed.
let cachedRaw: string | null | undefined;
let cached: Session | null = null;

function parse(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const result = sessionSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

function read(): Session | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // Storage blocked (private window): behave as logged out.
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parse(raw);
  }
  return cached;
}

function write(next: Session | null) {
  try {
    if (next) window.localStorage.setItem(KEY, JSON.stringify(next));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to do: the session then lasts only until the tab closes.
    cachedRaw = next ? JSON.stringify(next) : null;
    cached = next;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** For code outside React (the API client). */
export function getSession(): Session | null {
  return typeof window === "undefined" ? null : read();
}

/** Login: with exactly one firm it is opened straight away, otherwise the picker decides. */
export function saveLogin(res: LoginResponse) {
  write({
    token: res.token,
    userId: res.userId,
    businesses: res.businesses,
    businessId: res.businesses.length === 1 ? res.businesses[0].id : null,
  });
}

export function chooseBusiness(businessId: string) {
  const session = read();
  if (session) write({ ...session, businessId });
}

export function clearBusiness() {
  const session = read();
  if (session) write({ ...session, businessId: null });
}

export function clearSession() {
  write(null);
}

/** `undefined` until the browser has read storage, `null` when logged out. */
export function useSession(): Session | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

export function currentBusiness(session: Session | null | undefined): LoginBusiness | undefined {
  return session?.businesses.find((b) => b.id === session.businessId);
}
