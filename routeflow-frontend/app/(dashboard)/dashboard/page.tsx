"use client";

import Link from "next/link";
import { ClipboardList, Truck, PackageCheck, Users2, Boxes, CarFront } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { PageHeader, StatCard, Card, CardHeader, CardBody, ErrorState, StatusBadge, EmptyState } from "@/components/ui";
import { StatusBarChart } from "@/components/charts/StatusBarChart";
import { useAuth } from "@/providers/auth-provider";
import { formatDateTime, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useDashboard();

  if (error) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  const deliveredCount = data?.deliveries.by_status.delivered ?? 0;
  const failedCount = data?.deliveries.by_status.failed ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Here's what's happening across your operations today."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total orders" value={data?.orders.total ?? 0} icon={ClipboardList} tone="brand" loading={isLoading} />
        <StatCard label="Active deliveries" value={data?.deliveries.active.length ?? 0} icon={Truck} tone="info" loading={isLoading} />
        <StatCard label="Delivered" value={deliveredCount} icon={PackageCheck} tone="success" loading={isLoading} />
        <StatCard label="Failed" value={failedCount} icon={PackageCheck} tone="danger" loading={isLoading} />
        <StatCard
          label="Drivers available"
          value={isLoading ? 0 : `${data?.fleet.drivers_available ?? 0}/${data?.fleet.drivers_total ?? 0}`}
          icon={Users2}
          tone="brand"
          loading={isLoading}
        />
        <StatCard
          label="Vehicles available"
          value={isLoading ? 0 : `${data?.fleet.vehicles_available ?? 0}/${data?.fleet.vehicles_total ?? 0}`}
          icon={CarFront}
          tone="brand"
          loading={isLoading}
        />
      </div>

      {!isLoading && (data?.inventory.low_stock_products ?? 0) > 0 && (
        <Link
          href="/inventory?low_stock=1"
          className="flex items-center gap-3 rounded-card border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning hover:border-warning/50"
        >
          <Boxes className="h-4.5 w-4.5 shrink-0" />
          <span>
            <span className="font-medium">{formatNumber(data?.inventory.low_stock_products)}</span> product
            {data?.inventory.low_stock_products === 1 ? " is" : "s are"} running low on stock across your warehouses.
          </span>
          <span className="ml-auto font-medium underline shrink-0">Review inventory</span>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Orders by status" />
          <CardBody>
            {isLoading ? (
              <div className="h-60 animate-pulse rounded bg-canvas" />
            ) : (
              <StatusBarChart data={data?.orders.by_status ?? {}} />
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Deliveries by status" />
          <CardBody>
            {isLoading ? (
              <div className="h-60 animate-pulse rounded bg-canvas" />
            ) : (
              <StatusBarChart data={data?.deliveries.by_status ?? {}} />
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Active deliveries"
          description="Deliveries currently in progress, not yet delivered, returned, or cancelled."
          action={
            <Link href="/deliveries" className="text-sm font-medium text-brand hover:underline">
              View all
            </Link>
          }
        />
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-canvas" />
            ))}
          </div>
        ) : data && data.deliveries.active.length > 0 ? (
          <div className="divide-y divide-border">
            {data.deliveries.active.map((delivery) => (
              <Link
                key={delivery.id}
                href={`/deliveries/${delivery.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-canvas/60"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{delivery.delivery_number}</p>
                  <p className="text-xs text-neutral truncate">
                    {delivery.driver?.name ?? "Unassigned"}
                    {delivery.vehicle?.plate_number ? ` · ${delivery.vehicle.plate_number}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="hidden sm:block text-xs text-neutral">{formatDateTime(delivery.scheduled_at)}</span>
                  <StatusBadge status={delivery.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState title="No active deliveries" description="Deliveries in progress will show up here." />
          </div>
        )}
      </Card>
    </div>
  );
}
