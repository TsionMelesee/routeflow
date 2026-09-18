import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, hint, id, required, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-9 rounded-control border border-border bg-surface px-3 text-sm text-ink placeholder:text-neutral",
            "focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400",
            "disabled:bg-canvas disabled:text-neutral disabled:cursor-not-allowed",
            error && "border-danger focus:ring-red-100 focus:border-danger",
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? (
          <p className="text-xs text-danger">{error}</p>
        ) : hint ? (
          <p className="text-xs text-neutral">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
