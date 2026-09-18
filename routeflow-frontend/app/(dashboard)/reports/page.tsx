"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, TrendingUp, Truck, UserCog, Warehouse as WarehouseIcon } from "lucide-react";
import { useDeliveriesReport, useDriversReport, useRevenueReport, useWarehousesReport } from "@/hooks/use-reports";
import { reportsApi } from "@/lib/api/reports";
import { Button, Card, CardBody, CardHeader, DateRangePicker, PageHeader, StatCard, Tabs } from "@/components/ui";
import { StatusBarChart } from "@/components/charts/StatusBarChart";
import { formatCurrency, formatNumber, titleCase } from "@/lib/utils";
import { format, subDays } from "date-fns";

type ReportTab = "deliveries" | "drivers" | "warehouses" | "revenue";

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>("deliveries");
  const [range, setRange] = useState({
    from: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });
  const [exporting, setExporting] = useState(false);

  const filters = { from: range.from, to: range.to };

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await reportsApi.exportDeliveries(filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `deliveries-${range.from}-to-${range.to}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Couldn't export the report.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" description="Operational performance over a date range." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={tab}
          onChange={(v) => setTab(v as ReportTab)}
          items={[
            { value: "deliveries", label: "Deliveries" },
            { value: "drivers", label: "Drivers" },
            { value: "warehouses", label: "Warehouses" },
            { value: "revenue", label: "Revenue" },
          ]}
        />
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {tab === "deliveries" && <DeliveriesReportTab filters={filters} onExport={handleExport} exporting={exporting} />}
      {tab === "drivers" && <DriversReportTab filters={filters} />}
      {tab === "warehouses" && <WarehousesReportTab filters={filters} />}
      {tab === "revenue" && <RevenueReportTab filters={filters} />}
    </div>
  );
}

function DeliveriesReportTab({ filters, onExport, exporting }: { filters: { from: string; to: string }; onExport: () => void; exporting: boolean }) {
  const { data, isLoading } = useDeliveriesReport(filters);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total deliveries" value={data?.total ?? 0} icon={Truck} tone="brand" loading={isLoading} />
        <StatCard label="Delivered" value={data?.delivered ?? 0} tone="success" loading={isLoading} />
        <StatCard label="Failed" value={data?.failed ?? 0} tone="danger" loading={isLoading} />
        <StatCard
          label="Success rate"
          value={data?.success_rate !== null && data?.success_rate !== undefined ? `${data.success_rate}%` : "—"}
          tone="info"
          loading={isLoading}
        />
      </div>
      <Card>
        <CardHeader
          title="By status"
          description={data?.average_delivery_minutes ? `Average delivery time: ${data.average_delivery_minutes} min` : undefined}
          action={
            <Button size="sm" variant="outline" icon={<Download className="h-3.5 w-3.5" />} onClick={onExport} loading={exporting}>
              Export CSV
            </Button>
          }
        />
        <CardBody>{isLoading ? <div className="h-60 animate-pulse rounded bg-canvas" /> : <StatusBarChart data={data?.by_status ?? {}} />}</CardBody>
      </Card>
    </div>
  );
}

function DriversReportTab({ filters }: { filters: { from: string; to: string } }) {
  const { data, isLoading } = useDriversReport(filters);
  const rows = data?.data ?? [];
  return (
    <Card>
      <CardHeader title="Driver performance" description="Deliveries completed within the selected period." />
      {isLoading ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-canvas" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="p-5 text-center text-sm text-neutral flex flex-col items-center gap-2">
          <UserCog className="h-8 w-8 text-neutral" />
          No driver activity in this period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas/60 text-left text-xs text-neutral">
                <th className="px-5 py-2.5">Driver</th>
                <th className="px-5 py-2.5 text-right">Total</th>
                <th className="px-5 py-2.5 text-right">Delivered</th>
                <th className="px-5 py-2.5 text-right">Failed</th>
                <th className="px-5 py-2.5 text-right">Success rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.driver_id}>
                  <td className="px-5 py-2.5 font-medium text-ink">{row.name ?? `Driver #${row.driver_id}`}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{formatNumber(row.total_deliveries)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums text-success">{formatNumber(row.delivered)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums text-danger">{formatNumber(row.failed)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums font-medium">{row.success_rate !== null ? `${row.success_rate}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function WarehousesReportTab({ filters }: { filters: { from: string; to: string } }) {
  const { data, isLoading } = useWarehousesReport(filters);
  const rows = data?.data ?? [];
  return (
    <Card>
      <CardHeader title="Warehouse activity" description="Shipments dispatched and stock movement within the selected period." />
      {isLoading ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded bg-canvas" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="p-5 text-center text-sm text-neutral flex flex-col items-center gap-2">
          <WarehouseIcon className="h-8 w-8 text-neutral" />
          No warehouses to report on.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <div key={row.warehouse_id} className="px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">{row.name}</p>
                <span className="text-sm text-neutral">{formatNumber(row.shipments_dispatched)} shipments dispatched</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(row.units_by_movement_type).map(([type, units]) => (
                  <span key={type} className="rounded-full bg-canvas px-2.5 py-1 text-xs text-neutral">
                    {titleCase(type)}: <span className="font-medium text-ink">{formatNumber(units)}</span>
                  </span>
                ))}
                {Object.keys(row.units_by_movement_type).length === 0 && <span className="text-xs text-neutral">No stock movement recorded.</span>}
              </div>
              <p className="mt-1.5 text-xs text-neutral">{formatNumber(row.products_stocked)} products currently stocked</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function RevenueReportTab({ filters }: { filters: { from: string; to: string } }) {
  const { data, isLoading } = useRevenueReport(filters);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total revenue" value={data ? formatCurrency(data.total_revenue) : "—"} icon={TrendingUp} tone="success" loading={isLoading} />
        <StatCard label="Orders counted" value={data?.orders_counted ?? 0} tone="brand" loading={isLoading} />
        <StatCard label="Average order value" value={data?.average_order_value ? formatCurrency(data.average_order_value) : "—"} tone="info" loading={isLoading} />
      </div>
      {!isLoading && data && data.orders_missing_pricing > 0 && (
        <div className="rounded-card border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning">
          {formatNumber(data.orders_missing_pricing)} order{data.orders_missing_pricing === 1 ? "" : "s"} in this period had line items with no
          unit price set, so revenue may be understated.
        </div>
      )}
    </div>
  );
}
