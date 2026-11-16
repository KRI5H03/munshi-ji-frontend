import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { isApiError } from "@/lib/api/client";

/**
 * Puts each VALIDATION_FAILED message under its field.
 * Returns true when every message found a field, so the caller knows nothing is left to show.
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean {
  if (!isApiError(error) || error.code !== "VALIDATION_FAILED" || error.fields.length === 0) return false;
  let allPlaced = true;
  error.fields.forEach((issue, index) => {
    const name = fields.find((field) => field === issue.field);
    if (name) setError(name, { type: "server", message: issue.message }, { shouldFocus: index === 0 });
    else allPlaced = false;
  });
  return allPlaced;
}
