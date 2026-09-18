"use client";

import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { useDeliveries } from "@/hooks/use-deliveries";
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryParams } from "@/hooks/use-query-params";
import { DataTable, FilterBar, Pagination, PageHeader, SearchInput, Select, StatusBadge } from "@/components/ui";
import type { Column } from "@/components/ui";
import type { Delivery } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { useState } from "react";

export default function DeliveriesPage() {
  const router = useRouter();
  const { get, set } = useQueryParams();
  const [search, setSearch] = useState(get("search"));
  const debouncedSearch = useDebounce(search);
  const page = Number(get("page") || 1);
  const status = get("status");

  const { data, isLoading, error, refetch } = useDeliveries({
    page,
    search: debouncedSearch || undefined,
    status: (status as Delivery["status"]) || undefined,
  });

  function handleSearchChange(value: string) {
    setSearch(value);
    set({ search: value || undefined });
  }

  const columns: Column<Delivery>[] = [
    { key: "number", header: "Delivery", render: (d) => <span className="font-medium text-ink">{d.delivery_number}</span> },
    { key: "driver", header: "Driver", render: (d) => d.driver?.name ?? "Unassigned" },
    { key: "vehicle", header: "Vehicle", render: (d) => d.vehicle?.plate_number ?? "—" },
    { key: "scheduled", header: "Scheduled", render: (d) => formatDateTime(d.scheduled_at) },
    { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Deliveries" description="Track every delivery from assignment to drop-off." />

      <FilterBar>
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search delivery number…" className="w-72" />
        <Select
          options={[
            { value: "pending", label: "Pending" },
            { value: "assigned", label: "Assigned" },
            { value: "picked_up", label: "Picked up" },
            { value: "in_transit", label: "In transit" },
            { value: "out_for_delivery", label: "Out for delivery" },
            { value: "delivered", label: "Delivered" },
            { value: "failed", label: "Failed" },
            { value: "rescheduled", label: "Rescheduled" },
            { value: "returned", label: "Returned" },
            { value: "cancelled", label: "Cancelled" },
          ]}
          placeholder="All statuses"
          value={status}
          onChange={(e) => set({ status: e.target.value || undefined })}
          className="w-48"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={data?.data}
        rowKey={(d) => d.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(d) => router.push(`/deliveries/${d.id}`)}
        emptyState={{
          icon: Truck,
          title: "No deliveries yet",
          description: "Deliveries are created from a shipment that's ready for pickup.",
        }}
        footer={data?.meta && <Pagination meta={data.meta} onPageChange={(p) => set({ page: p })} />}
      />
    </div>
  );
}
