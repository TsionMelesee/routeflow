"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Pencil, Scale, Trash2, Warehouse as WarehouseIcon } from "lucide-react";
import { useDeleteProduct, useProduct, useUpdateProduct } from "@/hooks/use-products";
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
import { ProductForm, type ProductFormValues } from "@/components/products/ProductForm";
import { cn, formatNumber } from "@/lib/utils";
import { Boxes } from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const productId = Number(id);
  const router = useRouter();
  const { data: product, isLoading, error, refetch } = useProduct(productId);
  const updateProduct = useUpdateProduct(productId);
  const deleteProduct = useDeleteProduct();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  if (isLoading) return <LoadingState label="Loading product…" />;
  if (error || !product) return <ErrorState error={error} onRetry={() => refetch()} />;

  async function handleUpdate(values: ProductFormValues) {
    await updateProduct.mutateAsync({ ...values, weight: values.weight === "" ? null : Number(values.weight) });
    toast.success("Product updated.");
    setEditOpen(false);
  }

  async function handleDelete() {
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success("Product deleted.");
      router.push("/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete this product.");
      setConfirmDeleteOpen(false);
    }
  }

  const warehouses = product.warehouses ?? [];
  const lowStockWarehouses = warehouses.filter((w) => w.quantity <= product.low_stock_threshold);

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Products", href: "/products" }, { label: product.name }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-ink">{product.name}</h1>
            <StatusBadge status={product.status} />
          </div>
          <p className="text-sm text-neutral font-mono mt-0.5">{product.sku}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="outline" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total stock" value={product.total_quantity ?? 0} icon={Boxes} tone="brand" />
        <StatCard label="Weight" value={product.weight ? `${product.weight} kg` : "—"} icon={Scale} tone="info" />
        <StatCard
          label="Low stock warehouses"
          value={lowStockWarehouses.length}
          icon={AlertTriangle}
          tone={lowStockWarehouses.length > 0 ? "warning" : "success"}
        />
      </div>

      {product.description && (
        <Card>
          <CardHeader title="Description" />
          <CardBody>
            <p className="text-sm text-ink whitespace-pre-wrap">{product.description}</p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Stock by warehouse" description={`Low-stock threshold: ${formatNumber(product.low_stock_threshold)} units`} />
        {warehouses.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={WarehouseIcon} title="Not stocked anywhere yet" description="This product hasn't been added to any warehouse's inventory." />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {warehouses.map((w) => {
              const low = w.quantity <= product.low_stock_threshold;
              return (
                <div key={w.warehouse_id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2">
                    <WarehouseIcon className="h-4 w-4 text-neutral" />
                    <span className="text-sm font-medium text-ink">{w.warehouse_name}</span>
                    {low && (
                      <span className="flex items-center gap-1 text-xs font-medium text-warning">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Low stock
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm tabular-nums">
                    <span className="text-neutral">
                      Reserved <span className="text-ink font-medium">{formatNumber(w.reserved_quantity)}</span>
                    </span>
                    <span className="text-neutral">
                      Available <span className="text-ink font-medium">{formatNumber(w.available_quantity)}</span>
                    </span>
                    <span className={cn("font-semibold", low ? "text-warning" : "text-ink")}>
                      {formatNumber(w.quantity)} on hand
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit product" size="lg">
        <ProductForm product={product} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} submitLabel="Save changes" />
      </Modal>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this product?"
        description={`This will permanently remove ${product.name}.`}
        confirmLabel="Delete product"
        variant="danger"
        loading={deleteProduct.isPending}
      />
    </div>
  );
}
