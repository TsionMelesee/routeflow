import { cn, titleCase } from "@/lib/utils";

type StatusFamily = "success" | "warning" | "danger" | "info" | "neutral";

const STATUS_MAP: Record<string, StatusFamily> = {
  // Orders
  pending: "warning",
  processing: "info",
  shipped: "info",
  completed: "success",
  // Shipments
  preparing: "warning",
  ready_for_pickup: "warning",
  in_transit: "info",
  delivered: "success",
  // Deliveries
  assigned: "info",
  picked_up: "info",
  out_for_delivery: "info",
  failed: "danger",
  rescheduled: "warning",
  returned: "neutral",
  cancelled: "danger",
  // Drivers / Vehicles / generic active-inactive
  active: "success",
  available: "success",
  on_delivery: "info",
  in_use: "info",
  off_duty: "neutral",
  maintenance: "warning",
  inactive: "neutral",
  suspended: "danger",
  discontinued: "neutral",
};

const FAMILY_STYLES: Record<StatusFamily, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  neutral: "bg-neutral-bg text-neutral",
};

const DOT_STYLES: Record<StatusFamily, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-neutral",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const family = STATUS_MAP[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        FAMILY_STYLES[family],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_STYLES[family])} />
      {titleCase(status)}
    </span>
  );
}
