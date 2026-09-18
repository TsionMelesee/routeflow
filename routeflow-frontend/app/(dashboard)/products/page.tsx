"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Boxes, Plus } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryParams } from "@/hooks/use-query-params";
import { Button, DataTable, FilterBar, Pagination, PageHeader, SearchInput, Select, StatusBadge } from "@/components/ui";
import type { Column } from "@/components/ui";
import type { Product } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";
import { useState } from "react";

function isLowStock(product: Product): boolean {
  return (product.warehouses ?? []).some((w) => w.quantity <= product.low_stock_threshold);
}

export default function ProductsPage() {
  const router = useRouter();
  const { get, set } = useQueryParams();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(get("search"));
  const debouncedSearch = useDebounce(search);
  const page = Number(get("page") || 1);
  const status = get("status");
  const lowStockOnly = searchParams.get("low_stock") === "1";

  const { data, isLoading, error, refetch } = useProducts({
    page,
    search: debouncedSearch || undefined,
    status: (status as "active" | "inactive" | "discontinued") || undefined,
    low_stock: lowStockOnly || undefined,
  });

  function handleSearchChange(value: string) {
    setSearch(value);
    set({ search: value || undefined });
  }

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "Product",
      render: (p) => (
        <div>
          <p className="font-medium text-ink">{p.name}</p>
          <p className="text-xs text-neutral font-mono">{p.sku}</p>
        </div>
      ),
    },
    {
      key: "stock",
      header: "Total stock",
      render: (p) => (
        <span className={cn("tabular-nums", isLowStock(p) && "text-warning font-medium")}>
          {formatNumber(p.total_quantity ?? 0)}
          {isLowStock(p) && <AlertTriangle className="inline h-3.5 w-3.5 ml-1.5 -mt-0.5" />}
        </span>
      ),
    },
    { key: "weight", header: "Weight", render: (p) => (p.weight ? `${p.weight} kg` : "—") },
    { key: "threshold", header: "Low stock at", render: (p) => formatNumber(p.low_stock_threshold) },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products"
        description="Everything you stock and ship."
        actions={
          <Link href="/products/create">
            <Button icon={<Plus className="h-4 w-4" />}>Add product</Button>
          </Link>
        }
      />

      <FilterBar>
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search by name or SKU…" className="w-72" />
        <Select
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "discontinued", label: "Discontinued" },
          ]}
          placeholder="All statuses"
          value={status}
          onChange={(e) => set({ status: e.target.value || undefined })}
          className="w-40"
        />
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none ml-auto">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => set({ low_stock: e.target.checked ? "1" : undefined })}
            className="h-4 w-4 rounded border-border text-brand focus:ring-brand-200"
          />
          Low stock only
        </label>
      </FilterBar>

      <DataTable
        columns={columns}
        data={data?.data}
        rowKey={(p) => p.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(p) => router.push(`/products/${p.id}`)}
        emptyState={{
          icon: Boxes,
          title: "No products yet",
          description: "Add your first product to start tracking inventory.",
          action: { label: "Add product", onClick: () => router.push("/products/create") },
        }}
        footer={data?.meta && <Pagination meta={data.meta} onPageChange={(p) => set({ page: p })} />}
      />
    </div>
  );
}
