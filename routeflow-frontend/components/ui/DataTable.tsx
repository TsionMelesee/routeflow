"use client";

import { cn } from "@/lib/utils";
import { TableSkeleton } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import type { EmptyStateProps } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyState: EmptyStateProps;
  onRowClick?: (row: T) => void;
  /** Rendered inside the same card, below the rows — typically <Pagination />. */
  footer?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading,
  error,
  onRetry,
  emptyState,
  onRowClick,
  footer,
}: DataTableProps<T>) {
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-canvas/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-2.5 text-left text-xs font-medium text-neutral whitespace-nowrap",
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          {!isLoading && data && data.length > 0 && (
            <tbody className="divide-y divide-border">
              {data.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn("h-11", onRowClick && "cursor-pointer hover:bg-canvas/60")}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-2.5 text-ink", col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      {isLoading && <TableSkeleton cols={columns.length} />}
      {!isLoading && data && data.length === 0 && (
        <div className="p-2">
          <EmptyState {...emptyState} />
        </div>
      )}
      {!isLoading && data && data.length > 0 && footer}
    </div>
  );
}
