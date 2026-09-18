"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, PackagePlus, Pencil, Phone, Trash2, MapPin } from "lucide-react";
import { useDeleteWarehouse, useUpdateWarehouse, useWarehouse, useWarehouseInventory } from "@/hooks/use-warehouses";
import {
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { WarehouseForm, type WarehouseFormValues } from "@/components/warehouses/WarehouseForm";
import { AdjustStockModal } from "@/components/inventory/AdjustStockModal";
import { cn, formatNumber } from "@/lib/utils";
import { Boxes } from "lucide-react";
import type { ProductStock } from "@/lib/types";

export default function WarehouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const warehouseId = Number(id);
  const router = useRouter();
  const { data: warehouse, isLoading, error, refetch } = useWarehouse(warehouseId);
  const { data: inventory, isLoading: inventoryLoading } = useWarehouseInventory(warehouseId);
  const updateWarehouse = useUpdateWarehouse(warehouseId);
  const deleteWarehouse = useDeleteWarehouse();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<ProductStock | null>(null);
  const [adjustNewProductOpen, setAdjustNewProductOpen] = useState(false);

  if (isLoading) return <LoadingState label="Loading warehouse…" />;
  if (error || !warehouse) return <ErrorState error={error} onRetry={() => refetch()} />;

  async function handleUpdate(values: WarehouseFormValues) {
    await updateWarehouse.mutateAsync({ ...values, manager_id: values.manager_id ? Number(values.manager_id) : null });
    toast.success("Warehouse updated.");
    setEditOpen(false);
  }

  async function handleDelete() {
    try {
      await deleteWarehouse.mutateAsync(warehouseId);
      toast.success("Warehouse deleted.");
      router.push("/warehouses");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete this warehouse.");
      setConfirmDeleteOpen(false);
    }
  }

  const products = inventory ?? [];
  const lowStockCount = products.filter((p) => p.quantity <= p.low_stock_threshold).length;
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Warehouses", href: "/warehouses" }, { label: warehouse.name }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-ink">{warehouse.name}</h1>
            <StatusBadge status={warehouse.status} />
          </div>
          <p className="text-sm text-neutral font-mono mt-0.5">{warehouse.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<PackagePlus className="h-4 w-4" />} onClick={() => setAdjustNewProductOpen(true)}>
            Adjust stock
          </Button>
          <Button variant="outline" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="outline" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Products stocked" value={products.length} icon={Boxes} tone="brand" loading={inventoryLoading} />
        <StatCard label="Total units on hand" value={totalUnits} tone="info" loading={inventoryLoading} />
        <StatCard label="Low stock items" value={lowStockCount} icon={AlertTriangle} tone={lowStockCount > 0 ? "warning" : "success"} loading={inventoryLoading} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Details" />
          <CardBody className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 text-neutral shrink-0" />
              <div>
                <p className="text-xs text-neutral">Location</p>
                <p className="text-sm text-ink">{[warehouse.address, warehouse.city].filter(Boolean).join(", ") || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 mt-0.5 text-neutral shrink-0" />
              <div>
                <p className="text-xs text-neutral">Phone</p>
                <p className="text-sm text-ink">{warehouse.phone || "—"}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-neutral">Manager</p>
              <p className="text-sm text-ink">{warehouse.manager?.name ?? "Unassigned"}</p>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Inventory" description="Every product currently stocked at this warehouse." />
          {inventoryLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-canvas" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Boxes}
                title="No stock yet"
                description="Adjust stock to record the first units received at this warehouse."
                action={{ label: "Adjust stock", onClick: () => setAdjustNewProductOpen(true) }}
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
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit warehouse" size="lg">
        <WarehouseForm warehouse={warehouse} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} submitLabel="Save changes" />
      </Modal>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this warehouse?"
        description={`This will permanently remove ${warehouse.name}.`}
        confirmLabel="Delete warehouse"
        variant="danger"
        loading={deleteWarehouse.isPending}
      />

      <AdjustStockModal
        open={Boolean(adjustTarget)}
        onClose={() => setAdjustTarget(null)}
        presetWarehouseId={warehouseId}
        presetProduct={adjustTarget ? { id: adjustTarget.product_id, label: `${adjustTarget.name} (${adjustTarget.sku})` } : undefined}
      />
      <AdjustStockModal open={adjustNewProductOpen} onClose={() => setAdjustNewProductOpen(false)} presetWarehouseId={warehouseId} />
    </div>
  );
}
