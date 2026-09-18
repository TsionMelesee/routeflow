import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
tone?: "brand" | "success" | "warning" | "danger" | "info" | "neutral";
  loading?: boolean;
}

const TONE_STYLES = {
  brand: "bg-brand-50 text-brand-600",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  neutral: "bg-neutral-bg text-neutral",
};

export function StatCard({ label, value, icon: Icon, trend, tone = "brand", loading }: StatCardProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-neutral">{label}</p>
        {Icon && (
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-control", TONE_STYLES[tone])}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-20 animate-pulse rounded bg-canvas" />
      ) : (
        <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-ink">
          {typeof value === "number" ? formatNumber(value) : value}
        </p>
      )}
      {trend && !loading && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              trend.value >= 0 ? "text-success" : "text-danger",
            )}
          >
            {trend.value >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(trend.value)}%
          </span>
          {trend.label && <span className="text-neutral">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
