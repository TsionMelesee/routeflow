"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeftRight, Boxes, PackagePlus } from "lucide-react";
import { useAllWarehouses, useWarehouseInventory } from "@/hooks/use-warehouses";
import { useQueryParams } from "@/hooks/use-query-params";
import { Button, Card, EmptyState, FilterBar, LoadingState, PageHeader, Select } from "@/components/ui";
import { AdjustStockModal } from "@/components/inventory/AdjustStockModal";
import { cn, formatNumber } from "@/lib/utils";
import type { ProductStock } from "@/lib/types";

export default function InventoryPage() {
  const { get, set } = useQueryParams();
  const { data: warehousesData, isLoading: warehousesLoading } = useAllWarehouses();
  const warehouses = warehousesData?.data ?? [];

  const paramWarehouse = get("warehouse");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(paramWarehouse ? Number(paramWarehouse) : null);
  const lowStockOnly = get("low_stock") === "1";

  useEffect(() => {
    if (!selectedWarehouseId && warehouses.length > 0) {
      setSelectedWarehouseId(warehouses[0].id);
    }
  }, [warehouses, selectedWarehouseId]);

  const { data: inventory, isLoading: inventoryLoading } = useWarehouseInventory(selectedWarehouseId ?? -1);
  const [adjustTarget, setAdjustTarget] = useState<ProductStock | null>(null);
  const [adjustNewOpen, setAdjustNewOpen] = useState(false);

  const products = (inventory ?? []).filter((p) => !lowStockOnly || p.quantity <= p.low_stock_threshold);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventory"
        description="Stock levels by warehouse."
        actions={
          <Link href="/inventory/transfer">
            <Button variant="outline" icon={<ArrowLeftRight className="h-4 w-4" />}>
              Transfer stock
            </Button>
          </Link>
        }
      />

      <FilterBar>
        <Select
          options={warehouses.map((w) => ({ value: String(w.id), label: w.name }))}
          placeholder={warehousesLoading ? "Loading warehouses…" : "Select a warehouse"}
          value={selectedWarehouseId ? String(selectedWarehouseId) : ""}
          onChange={(e) => {
            const id = Number(e.target.value);
            setSelectedWarehouseId(id);
            set({ warehouse: id });
          }}
          className="w-64"
        />
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => set({ low_stock: e.target.checked ? "1" : undefined })}
            className="h-4 w-4 rounded border-border text-brand focus:ring-brand-200"
          />
          Low stock only
        </label>
        {selectedWarehouseId && (
          <Button size="sm" variant="secondary" icon={<PackagePlus className="h-4 w-4" />} className="ml-auto" onClick={() => setAdjustNewOpen(true)}>
            Adjust stock
          </Button>
        )}
      </FilterBar>

      <Card>
        {!selectedWarehouseId || inventoryLoading ? (
          <LoadingState label="Loading inventory…" />
        ) : products.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Boxes}
              title={lowStockOnly ? "Nothing is low on stock" : "No stock at this warehouse"}
              description={lowStockOnly ? "Every product here is above its low-stock threshold." : "Adjust stock to record units received here."}
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {products.map((p) => {
              const low = p.quantity <= p.low_stock_threshold;
              return (
                <button
                  key={p.product_id}
                  onClick={() => setAdjustTarget(p)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left hover:bg-canvas/60"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                    <p className="text-xs text-neutral font-mono">{p.sku}</p>
                  </div>
                  <div className="flex items-center gap-5 text-sm tabular-nums shrink-0">
                    <span className="text-neutral hidden sm:inline">
                      Reserved <span className="text-ink">{formatNumber(p.reserved_quantity)}</span>
                    </span>
                    <span className="text-neutral hidden sm:inline">
                      Available <span className="text-ink">{formatNumber(p.available_quantity)}</span>
                    </span>
                    <span className={cn("font-semibold flex items-center gap-1", low ? "text-warning" : "text-ink")}>
                      {low && <AlertTriangle className="h-3.5 w-3.5" />}
                      {formatNumber(p.quantity)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {selectedWarehouseId && (
        <>
          <AdjustStockModal
            open={Boolean(adjustTarget)}
            onClose={() => setAdjustTarget(null)}
            presetWarehouseId={selectedWarehouseId}
            presetProduct={adjustTarget ? { id: adjustTarget.product_id, label: `${adjustTarget.name} (${adjustTarget.sku})` } : undefined}
          />
          <AdjustStockModal open={adjustNewOpen} onClose={() => setAdjustNewOpen(false)} presetWarehouseId={selectedWarehouseId} />
        </>
      )}
    </div>
  );
}
