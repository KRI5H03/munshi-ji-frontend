// The one place that talks to the backend. Adds the token and the firm header,
// and turns every failure into an ApiError shaped like docs/API.md.
import { clearBusiness, clearSession, getSession } from "@/lib/session";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");

export type FieldIssue = { field: string; message: string };

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  /** Present on VALIDATION_FAILED: one message per field. */
  readonly fields: FieldIssue[];

  constructor(status: number, code: string, message: string, fields: FieldIssue[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** What to show when an error has no better place than a toast. */
export function errorMessage(error: unknown): string {
  if (isApiError(error)) return error.status >= 500 ? "Something went wrong. Please try again." : error.message;
  return "Something went wrong. Please try again.";
}

/** none = public route, user = needs the token, firm = needs the token and the open firm. */
type Access = "none" | "user" | "firm";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  access?: Access;
  query?: Record<string, string | undefined>;
  signal?: AbortSignal;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFieldIssue(value: unknown): value is FieldIssue {
  return isRecord(value) && typeof value.field === "string" && typeof value.message === "string";
}

function toApiError(status: number, payload: unknown): ApiError {
  const error = isRecord(payload) && isRecord(payload.error) ? payload.error : undefined;
  const code = typeof error?.code === "string" ? error.code : "INTERNAL";
  const message = typeof error?.message === "string" ? error.message : "Something went wrong. Please try again.";
  const fields = Array.isArray(error?.details) ? error.details.filter(isFieldIssue) : [];
  return new ApiError(status, code, message, fields);
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, access = "firm", query, signal } = options;
  const headers = new Headers();
  if (body !== undefined) headers.set("Content-Type", "application/json");

  if (access !== "none") {
    const session = getSession();
    if (!session) throw new ApiError(401, "UNAUTHENTICATED", "Please log in again.");
    headers.set("Authorization", `Bearer ${session.token}`);
    if (access === "firm") {
      if (!session.businessId) throw new ApiError(400, "BUSINESS_REQUIRED", "Choose a firm first.");
      headers.set("X-Business-Id", session.businessId);
    }
  }

  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiError(0, "NETWORK", "Cannot reach the server. Check the connection and try again.");
  }

  if (response.status === 204) return undefined as T;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const error = toApiError(response.status, payload);
    // The screens react to the session changing: no session -> login, no firm -> firm picker.
    if (access !== "none" && error.status === 401) clearSession();
    if (error.code === "BUSINESS_REQUIRED") clearBusiness();
    throw error;
  }

  return payload as T;
}
