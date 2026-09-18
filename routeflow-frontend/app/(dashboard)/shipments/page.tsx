"use client";

import { useRouter } from "next/navigation";
import { PackageCheck } from "lucide-react";
import { useShipments } from "@/hooks/use-shipments";
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryParams } from "@/hooks/use-query-params";
import { DataTable, FilterBar, Pagination, PageHeader, SearchInput, Select, StatusBadge } from "@/components/ui";
import type { Column } from "@/components/ui";
import type { Shipment } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";
import { useState } from "react";

export default function ShipmentsPage() {
  const router = useRouter();
  const { get, set } = useQueryParams();
  const [search, setSearch] = useState(get("search"));
  const debouncedSearch = useDebounce(search);
  const page = Number(get("page") || 1);
  const status = get("status");

  const { data, isLoading, error, refetch } = useShipments({
    page,
    search: debouncedSearch || undefined,
    status: (status as Shipment["status"]) || undefined,
  });

  function handleSearchChange(value: string) {
    setSearch(value);
    set({ search: value || undefined });
  }

  const columns: Column<Shipment>[] = [
    { key: "number", header: "Shipment", render: (s) => <span className="font-medium text-ink">{s.shipment_number}</span> },
    { key: "origin", header: "Origin", render: (s) => s.origin_warehouse?.name ?? "—" },
    { key: "destination", header: "Destination", render: (s) => <span className="truncate block max-w-[200px]">{[s.destination_address, s.destination_city].filter(Boolean).join(", ")}</span> },
    { key: "packages", header: "Packages", render: (s) => formatNumber(s.package_count) },
    { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
    { key: "expected", header: "Expected", render: (s) => formatDate(s.expected_delivery_at) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Shipments" description="Shipments dispatched from your warehouses." />

      <FilterBar>
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search shipment number…" className="w-72" />
        <Select
          options={[
            { value: "pending", label: "Pending" },
            { value: "preparing", label: "Preparing" },
            { value: "ready_for_pickup", label: "Ready for pickup" },
            { value: "in_transit", label: "In transit" },
            { value: "delivered", label: "Delivered" },
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
        rowKey={(s) => s.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(s) => router.push(`/shipments/${s.id}`)}
        emptyState={{
          icon: PackageCheck,
          title: "No shipments yet",
          description: "Shipments are created from a processing order.",
        }}
        footer={data?.meta && <Pagination meta={data.meta} onPageChange={(p) => set({ page: p })} />}
      />
    </div>
  );
}
