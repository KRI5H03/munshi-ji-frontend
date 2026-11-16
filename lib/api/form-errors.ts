import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { isApiError } from "@/lib/api/client";

/**
 * Puts each VALIDATION_FAILED message under its field.
 * `fieldFor` turns the API's field path (like "lines.0.qty") into a form field, or undefined when the form has none.
 * Returns true when every message found a field, so the caller knows nothing is left to show.
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldFor: readonly Path<T>[] | ((apiField: string) => Path<T> | undefined),
): boolean {
  if (!isApiError(error) || error.code !== "VALIDATION_FAILED" || error.fields.length === 0) return false;
  const find =
    typeof fieldFor === "function" ? fieldFor : (apiField: string) => fieldFor.find((field) => field === apiField);
  let allPlaced = true;
  error.fields.forEach((issue, index) => {
    const name = find(issue.field);
    if (name) setError(name, { type: "server", message: issue.message }, { shouldFocus: index === 0 });
    else allPlaced = false;
  });
  return allPlaced;
}
