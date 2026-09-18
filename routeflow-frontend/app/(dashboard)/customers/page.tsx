"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { useCustomers } from "@/hooks/use-customers";
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryParams } from "@/hooks/use-query-params";
import { Button, DataTable, FilterBar, Pagination, PageHeader, SearchInput, Select, StatusBadge } from "@/components/ui";
import type { Column } from "@/components/ui";
import type { Customer } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

export default function CustomersPage() {
  const router = useRouter();
  const { get, set } = useQueryParams();
  const [search, setSearch] = useState(get("search"));
  const debouncedSearch = useDebounce(search);
  const page = Number(get("page") || 1);
  const status = get("status");

  const { data, isLoading, error, refetch } = useCustomers({
    page,
    search: debouncedSearch || undefined,
    status: (status as "active" | "inactive") || undefined,
  });

  function handleSearchChange(value: string) {
    setSearch(value);
    set({ search: value || undefined });
  }

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      render: (c) => (
        <div>
          <p className="font-medium text-ink">{c.name}</p>
          {c.company_name && <p className="text-xs text-neutral">{c.company_name}</p>}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (c) => (
        <div className="text-sm">
          <p>{c.email || "—"}</p>
          <p className="text-xs text-neutral">{c.phone || "—"}</p>
        </div>
      ),
    },
    { key: "location", header: "Location", render: (c) => [c.city, c.country].filter(Boolean).join(", ") || "—" },
    { key: "orders", header: "Orders", render: (c) => c.orders_count ?? "—" },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    { key: "created", header: "Added", render: (c) => formatDate(c.created_at) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customers"
        description="Everyone you ship orders for."
        actions={
          <Link href="/customers/create">
            <Button icon={<Plus className="h-4 w-4" />}>Add customer</Button>
          </Link>
        }
      />

      <FilterBar>
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search by name or company…" className="w-72" />
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
        rowKey={(c) => c.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(c) => router.push(`/customers/${c.id}`)}
        emptyState={{
          icon: Users,
          title: "No customers yet",
          description: "Create your first customer to start placing orders.",
          action: { label: "Add customer", onClick: () => router.push("/customers/create") },
        }}
        footer={data?.meta && <Pagination meta={data.meta} onPageChange={(p) => set({ page: p })} />}
      />
    </div>
  );
}
