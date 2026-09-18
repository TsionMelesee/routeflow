"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { titleCase } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "#D97706",
  processing: "#2563EB",
  shipped: "#2563EB",
  completed: "#16A34A",
  preparing: "#D97706",
  ready_for_pickup: "#D97706",
  in_transit: "#2563EB",
  delivered: "#16A34A",
  assigned: "#2563EB",
  picked_up: "#2563EB",
  out_for_delivery: "#2563EB",
  failed: "#DC2626",
  rescheduled: "#D97706",
  returned: "#64748B",
  cancelled: "#DC2626",
};

export function StatusBarChart({ data }: { data: Partial<Record<string, number>> }) {
  const chartData = Object.entries(data)
    .filter(([, value]) => value !== undefined)
    .map(([status, value]) => ({ status: titleCase(status), raw: status, value }));

  if (chartData.length === 0) {
    return <p className="py-12 text-center text-sm text-neutral">No data for this period.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#E2E5EC" />
        <XAxis dataKey="status" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={{ stroke: "#E2E5EC" }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: "#F5F6FA" }}
          contentStyle={{ borderRadius: 8, border: "1px solid #E2E5EC", fontSize: 13 }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.raw} fill={STATUS_COLORS[entry.raw] ?? "#2A4B8D"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
