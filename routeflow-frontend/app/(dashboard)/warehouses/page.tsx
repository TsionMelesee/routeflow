"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Warehouse as WarehouseIcon } from "lucide-react";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useQueryParams } from "@/hooks/use-query-params";
import { Button, DataTable, FilterBar, Pagination, PageHeader, Select, StatusBadge } from "@/components/ui";
import type { Column } from "@/components/ui";
import type { Warehouse } from "@/lib/types";

export default function WarehousesPage() {
  const router = useRouter();
  const { get, set } = useQueryParams();
  const page = Number(get("page") || 1);
  const status = get("status");

  const { data, isLoading, error, refetch } = useWarehouses({
    page,
    status: (status as "active" | "inactive") || undefined,
  });

  const columns: Column<Warehouse>[] = [
    {
      key: "warehouse",
      header: "Warehouse",
      render: (w) => (
        <div>
          <p className="font-medium text-ink">{w.name}</p>
          <p className="text-xs text-neutral font-mono">{w.code}</p>
        </div>
      ),
    },
    { key: "location", header: "Location", render: (w) => [w.address, w.city].filter(Boolean).join(", ") || "—" },
    { key: "manager", header: "Manager", render: (w) => w.manager?.name ?? "Unassigned" },
    { key: "phone", header: "Phone", render: (w) => w.phone ?? "—" },
    { key: "status", header: "Status", render: (w) => <StatusBadge status={w.status} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Warehouses"
        description="Where your inventory physically lives."
        actions={
          <Link href="/warehouses/create">
            <Button icon={<Plus className="h-4 w-4" />}>Add warehouse</Button>
          </Link>
        }
      />

      <FilterBar>
        <Select
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          placeholder="All statuses"
          value={status}
          onChange={(e) => set({ status: e.target.value || undefined })}
          className="w-40"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={data?.data}
        rowKey={(w) => w.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(w) => router.push(`/warehouses/${w.id}`)}
        emptyState={{
          icon: WarehouseIcon,
          title: "No warehouses yet",
          description: "Add your first warehouse to start managing inventory.",
          action: { label: "Add warehouse", onClick: () => router.push("/warehouses/create") },
        }}
        footer={data?.meta && <Pagination meta={data.meta} onPageChange={(p) => set({ page: p })} />}
      />
    </div>
  );
}
