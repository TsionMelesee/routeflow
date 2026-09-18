"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardList, Plus } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryParams } from "@/hooks/use-query-params";
import { Button, DataTable, FilterBar, Pagination, PageHeader, SearchInput, Select, StatusBadge } from "@/components/ui";
import type { Column } from "@/components/ui";
import type { Order } from "@/lib/types";
import { formatDate, titleCase } from "@/lib/utils";
import { useState } from "react";

const PRIORITY_STYLES: Record<string, string> = {
  standard: "text-neutral",
  express: "text-info font-medium",
  urgent: "text-danger font-semibold",
};

export default function OrdersPage() {
  const router = useRouter();
  const { get, set } = useQueryParams();
  const [search, setSearch] = useState(get("search"));
  const debouncedSearch = useDebounce(search);
  const page = Number(get("page") || 1);
  const status = get("status");

  const { data, isLoading, error, refetch } = useOrders({
    page,
    search: debouncedSearch || undefined,
    status: (status as Order["status"]) || undefined,
  });

  function handleSearchChange(value: string) {
    setSearch(value);
    set({ search: value || undefined });
  }

  const columns: Column<Order>[] = [
    { key: "number", header: "Order", render: (o) => <span className="font-medium text-ink">{o.order_number}</span> },
    { key: "customer", header: "Customer", render: (o) => o.customer?.name ?? "—" },
    { key: "priority", header: "Priority", render: (o) => <span className={PRIORITY_STYLES[o.priority]}>{titleCase(o.priority)}</span> },
    { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
    { key: "delivery", header: "Delivery to", render: (o) => <span className="truncate block max-w-[200px]">{o.delivery_address}</span> },
    { key: "created", header: "Created", render: (o) => formatDate(o.created_at) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Orders"
        description="Customer orders and their fulfillment status."
        actions={
          <Link href="/orders/create">
            <Button icon={<Plus className="h-4 w-4" />}>New order</Button>
          </Link>
        }
      />

      <FilterBar>
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search order number…" className="w-72" />
        <Select
          options={[
            { value: "pending", label: "Pending" },
            { value: "processing", label: "Processing" },
            { value: "shipped", label: "Shipped" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
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
        rowKey={(o) => o.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(o) => router.push(`/orders/${o.id}`)}
        emptyState={{
          icon: ClipboardList,
          title: "No orders yet",
          description: "Create your first order to start the fulfillment workflow.",
          action: { label: "New order", onClick: () => router.push("/orders/create") },
        }}
        footer={data?.meta && <Pagination meta={data.meta} onPageChange={(p) => set({ page: p })} />}
      />
    </div>
  );
}
