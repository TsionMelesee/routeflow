"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, Plus } from "lucide-react";
import { useVehicles } from "@/hooks/use-vehicles";
import { useQueryParams } from "@/hooks/use-query-params";
import { Button, DataTable, FilterBar, Pagination, PageHeader, Select, StatusBadge } from "@/components/ui";
import type { Column } from "@/components/ui";
import type { Vehicle } from "@/lib/types";
import { titleCase } from "@/lib/utils";

export default function VehiclesPage() {
  const router = useRouter();
  const { get, set } = useQueryParams();
  const page = Number(get("page") || 1);
  const status = get("status");

  const { data, isLoading, error, refetch } = useVehicles({
    page,
    status: (status as Vehicle["status"]) || undefined,
  });

  const columns: Column<Vehicle>[] = [
    {
      key: "vehicle",
      header: "Vehicle",
      render: (v) => (
        <div>
          <p className="font-medium text-ink">{v.plate_number}</p>
          <p className="text-xs text-neutral">{v.model || "—"}</p>
        </div>
      ),
    },
    { key: "type", header: "Type", render: (v) => (v.type ? titleCase(v.type) : "—") },
    { key: "year", header: "Year", render: (v) => v.year ?? "—" },
    { key: "capacity", header: "Capacity", render: (v) => (v.capacity ? `${v.capacity} kg` : "—") },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v.status} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vehicles"
        description="Your delivery fleet."
        actions={
          <Link href="/vehicles/create">
            <Button icon={<Plus className="h-4 w-4" />}>Add vehicle</Button>
          </Link>
        }
      />

      <FilterBar>
        <Select
          options={[
            { value: "available", label: "Available" },
            { value: "in_use", label: "In use" },
            { value: "maintenance", label: "Maintenance" },
            { value: "inactive", label: "Inactive" },
          ]}
          placeholder="All statuses"
          value={status}
          onChange={(e) => set({ status: e.target.value || undefined })}
          className="w-44"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={data?.data}
        rowKey={(v) => v.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(v) => router.push(`/vehicles/${v.id}`)}
        emptyState={{
          icon: Car,
          title: "No vehicles yet",
          description: "Add your first vehicle to start assigning deliveries.",
          action: { label: "Add vehicle", onClick: () => router.push("/vehicles/create") },
        }}
        footer={data?.meta && <Pagination meta={data.meta} onPageChange={(p) => set({ page: p })} />}
      />
    </div>
  );
}
