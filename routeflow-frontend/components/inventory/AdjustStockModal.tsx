"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Modal, Button, ErrorBanner, Input, Select, Textarea } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import { inventoryApi } from "@/lib/api/inventory";
import { useAllWarehouses } from "@/hooks/use-warehouses";
import { useProducts } from "@/hooks/use-products";

const schema = z.object({
  warehouse_id: z.string().min(1, "Choose a warehouse"),
  product_id: z.string().min(1, "Choose a product"),
  direction: z.enum(["increase", "decrease"]),
  quantity: z.coerce.number().int().positive("Must be greater than zero"),
  notes: z.string().max(500).optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export interface AdjustStockModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-fills and locks the warehouse (used from a warehouse detail page). */
  presetWarehouseId?: number;
  /** Pre-fills and locks the product (used from a warehouse's inventory row). */
  presetProduct?: { id: number; label: string };
}

export function AdjustStockModal({ open, onClose, presetWarehouseId, presetProduct }: AdjustStockModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: warehousesData } = useAllWarehouses();
  const { data: productsData } = useProducts({ per_page: 100 });

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      warehouse_id: presetWarehouseId ? String(presetWarehouseId) : "",
      product_id: presetProduct ? String(presetProduct.id) : "",
      direction: "increase",
      quantity: 1,
    },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    const signedQuantity = values.direction === "increase" ? values.quantity : -values.quantity;
    try {
      await inventoryApi.adjust({
        warehouse_id: Number(values.warehouse_id),
        product_id: Number(values.product_id),
        quantity: signedQuantity,
        notes: values.notes || undefined,
      });
      toast.success("Stock adjusted.");
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
      onClose();
    } catch (error) {
      const message = applyApiErrorsToForm(error, setError);
      if (message) setFormError(message);
    }
  }

  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: String(w.id), label: w.name }));
  const productOptions = (productsData?.data ?? []).map((p) => ({ value: String(p.id), label: `${p.name} (${p.sku})` }));

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Adjust stock"
      description="Record received stock, damage, or a manual correction."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            Save adjustment
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <ErrorBanner error={formError} />

        {presetWarehouseId ? (
          <input type="hidden" {...register("warehouse_id")} />
        ) : (
          <Select label="Warehouse" required options={warehouseOptions} placeholder="Select a warehouse" error={errors.warehouse_id?.message} {...register("warehouse_id")} />
        )}

        {presetProduct ? (
          <div>
            <p className="text-sm font-medium text-ink mb-1.5">Product</p>
            <p className="text-sm text-neutral">{presetProduct.label}</p>
            <input type="hidden" {...register("product_id")} />
          </div>
        ) : (
          <Select label="Product" required options={productOptions} placeholder="Select a product" error={errors.product_id?.message} {...register("product_id")} />
        )}

        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <Controller
            control={control}
            name="direction"
            render={({ field }) => (
              <Select
                label="Direction"
                options={[
                  { value: "increase", label: "Increase (+)" },
                  { value: "decrease", label: "Decrease (−)" },
                ]}
                {...field}
              />
            )}
          />
          <Input label="Quantity" type="number" min={1} required error={errors.quantity?.message} {...register("quantity")} />
        </div>

        <Textarea label="Notes" placeholder="e.g. Received shipment from supplier, damaged in transit…" error={errors.notes?.message} {...register("notes")} />
      </form>
    </Modal>
  );
}
