import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-card border border-border bg-surface", className)}>{children}</div>;
}

export function CardHeader({ title, action, description }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">
      <div>
        <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-neutral">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
