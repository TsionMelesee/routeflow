"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, UserCog } from "lucide-react";
import { useDrivers } from "@/hooks/use-drivers";
import { useQueryParams } from "@/hooks/use-query-params";
import { Button, DataTable, FilterBar, Pagination, PageHeader, Select, StatusBadge } from "@/components/ui";
import type { Column } from "@/components/ui";
import type { Driver } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DriversPage() {
  const router = useRouter();
  const { get, set } = useQueryParams();
  const page = Number(get("page") || 1);
  const status = get("status");

  const { data, isLoading, error, refetch } = useDrivers({
    page,
    status: (status as Driver["status"]) || undefined,
  });

  const columns: Column<Driver>[] = [
    {
      key: "driver",
      header: "Driver",
      render: (d) => (
        <div>
          <p className="font-medium text-ink">{d.name}</p>
          <p className="text-xs text-neutral">{d.email}</p>
        </div>
      ),
    },
    { key: "license", header: "License", render: (d) => d.license_number },
    { key: "expiry", header: "Expires", render: (d) => formatDate(d.license_expiry) },
    { key: "active", header: "Active deliveries", render: (d) => d.active_deliveries_count ?? 0 },
    { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Drivers"
        description="Your delivery drivers and their availability."
        actions={
          <Link href="/drivers/create">
            <Button icon={<Plus className="h-4 w-4" />}>Add driver</Button>
          </Link>
        }
      />

      <FilterBar>
        <Select
          options={[
            { value: "available", label: "Available" },
            { value: "on_delivery", label: "On delivery" },
            { value: "off_duty", label: "Off duty" },
            { value: "suspended", label: "Suspended" },
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
        rowKey={(d) => d.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(d) => router.push(`/drivers/${d.id}`)}
        emptyState={{
          icon: UserCog,
          title: "No drivers yet",
          description: "Add your first driver to start assigning deliveries.",
          action: { label: "Add driver", onClick: () => router.push("/drivers/create") },
        }}
        footer={data?.meta && <Pagination meta={data.meta} onPageChange={(p) => set({ page: p })} />}
      />
    </div>
  );
}
