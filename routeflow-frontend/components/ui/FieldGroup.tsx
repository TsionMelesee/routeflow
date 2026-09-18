import { cn } from "@/lib/utils";

/** Simple responsive grid for form fields — 1 col mobile, 2 col desktop. */
export function FieldGroup({ children, cols = 2, className }: { children: React.ReactNode; cols?: 1 | 2; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4", cols === 2 && "sm:grid-cols-2", className)}>{children}</div>
  );
}
