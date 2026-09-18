import type { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { ApiError } from "@/lib/types";

/**
 * Maps a 422 validation response's { errors: { field: [msg] } } shape
 * onto react-hook-form field errors, so server-side validation renders
 * exactly like client-side validation. Falls back to a toast-worthy
 * message via the return value when the error isn't field-shaped (e.g. a
 * 403 or a business-rule 422 with no `errors` object).
 */
export function applyApiErrorsToForm<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): string | null {
  if (error instanceof ApiError && error.errors) {
    for (const [field, messages] of Object.entries(error.errors)) {
      setError(field as Path<T>, { type: "server", message: messages[0] });
    }
    return null;
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
