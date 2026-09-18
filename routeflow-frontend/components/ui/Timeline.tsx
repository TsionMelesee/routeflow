import { cn, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

export interface TimelineEntry {
  status: string;
  notes?: string | null;
  actor?: string | null;
  timestamp: string;
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-neutral">No history yet.</p>;
  }

  return (
    <ol className="relative space-y-6">
      {entries.map((entry, i) => (
        <li key={i} className="relative flex gap-3">
          <div className="flex flex-col items-center">
            <span className={cn("h-2.5 w-2.5 rounded-full", i === 0 ? "bg-brand" : "bg-border")} />
            {i < entries.length - 1 && <span className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className="pb-1 -mt-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={entry.status} />
              <span className="text-xs text-neutral">{formatDateTime(entry.timestamp)}</span>
            </div>
            {entry.notes && <p className="mt-1 text-sm text-ink">{entry.notes}</p>}
            {entry.actor && <p className="mt-0.5 text-xs text-neutral">by {entry.actor}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
