"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { Button, ErrorBanner, FieldGroup, Input, Select } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import { useAllWarehouses } from "@/hooks/use-warehouses";
import type { CreateShipmentPayload } from "@/lib/api/orders";
import type { Order } from "@/lib/types";

const schema = z.object({
  origin_warehouse_id: z.string().min(1, "Choose an origin warehouse"),
  destination_address: z.string().min(1, "Destination address is required").max(255),
  destination_city: z.string().max(255).optional().or(z.literal("")),
  priority: z.enum(["standard", "express", "urgent"]),
  expected_delivery_at: z.string().optional().or(z.literal("")),
  items: z.array(z.object({ product_id: z.number(), product_name: z.string(), quantity: z.coerce.number().int().positive("Must be at least 1") })).min(1),
});
type FormValues = z.infer<typeof schema>;

export function CreateShipmentForm({
  order,
  onSubmit,
  onCancel,
}: {
  order: Order;
  onSubmit: (payload: CreateShipmentPayload) => Promise<void>;
  onCancel?: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const { data: warehousesData } = useAllWarehouses();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      destination_address: order.delivery_address,
      destination_city: order.delivery_city ?? "",
      priority: order.priority,
      items: (order.items ?? []).map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name ?? `Product #${item.product_id}`,
        quantity: item.quantity,
      })),
    },
  });

  const { fields, remove } = useFieldArray({ control, name: "items" });
  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: String(w.id), label: w.name }));

  async function handleFormSubmit(values: FormValues) {
    setFormError(null);
    try {
      await onSubmit({
        origin_warehouse_id: Number(values.origin_warehouse_id),
        destination_address: values.destination_address,
        destination_city: values.destination_city || null,
        priority: values.priority,
        expected_delivery_at: values.expected_delivery_at || null,
        items: values.items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
      });
    } catch (error) {
      const message = applyApiErrorsToForm(error, setError);
      if (message) setFormError(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <ErrorBanner error={formError} />

      <Select label="Origin warehouse" required placeholder="Select a warehouse" options={warehouseOptions} error={errors.origin_warehouse_id?.message} {...register("origin_warehouse_id")} />

      <FieldGroup>
        <Input label="Destination address" required error={errors.destination_address?.message} {...register("destination_address")} />
        <Input label="Destination city" error={errors.destination_city?.message} {...register("destination_city")} />
      </FieldGroup>

      <FieldGroup>
        <Select
          label="Priority"
          options={[
            { value: "standard", label: "Standard" },
            { value: "express", label: "Express" },
            { value: "urgent", label: "Urgent" },
          ]}
          error={errors.priority?.message}
          {...register("priority")}
        />
        <Input label="Expected delivery" type="datetime-local" error={errors.expected_delivery_at?.message} {...register("expected_delivery_at")} />
      </FieldGroup>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-sm font-medium text-ink">Items to ship</p>
        {errors.items?.message && <p className="text-xs text-danger mb-2">{errors.items.message}</p>}
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2 rounded-control border border-border p-3">
              <div className="flex-1">
                <p className="text-sm text-ink">{field.product_name}</p>
              </div>
              <div className="w-24">
                <Input label={index === 0 ? "Qty" : undefined} type="number" min={1} error={errors.items?.[index]?.quantity?.message} {...register(`items.${index}.quantity`)} />
              </div>
              <Button type="button" variant="ghost" size="sm" className="text-danger hover:bg-danger-bg" onClick={() => fields.length > 1 && remove(index)} disabled={fields.length === 1}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          Create shipment
        </Button>
      </div>
    </form>
  );
}
