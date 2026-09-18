import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { ApiError } from "@/lib/types";

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-border bg-surface px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-bg">
        <AlertTriangle className="h-6 w-6 text-danger" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink">Couldn&apos;t load this</p>
        <p className="text-sm text-neutral max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}

/** Compact inline banner for form-level API errors (not field-level). */
export function ErrorBanner({ error }: { error: unknown }) {
  if (!error) return null;
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Something went wrong.";

  return (
    <div className="flex items-start gap-2 rounded-control border border-red-200 bg-danger-bg px-3 py-2 text-sm text-danger">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
