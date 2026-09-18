"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button, ErrorBanner, FieldGroup, Input, Select, Textarea } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import { useAllCustomersForSelect } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import type { CreateOrderPayload } from "@/lib/api/orders";

const itemSchema = z.object({
  product_id: z.string().min(1, "Select a product"),
  quantity: z.coerce.number().int().positive("Must be at least 1"),
  unit_price: z.coerce.number().min(0).optional().or(z.literal("")),
});

const schema = z.object({
  customer_id: z.string().min(1, "Select a customer"),
  priority: z.enum(["standard", "express", "urgent"]),
  pickup_address: z.string().max(255).optional().or(z.literal("")),
  pickup_city: z.string().max(255).optional().or(z.literal("")),
  delivery_address: z.string().min(1, "Delivery address is required").max(255),
  delivery_city: z.string().max(255).optional().or(z.literal("")),
  requested_at: z.string().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});
export type OrderFormValues = z.infer<typeof schema>;

export function OrderForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (payload: CreateOrderPayload) => Promise<void>;
  onCancel?: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const { data: customers } = useAllCustomersForSelect();
  const { data: productsData } = useProducts({ per_page: 100, status: "active" });

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "standard", items: [{ product_id: "", quantity: 1, unit_price: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const customerOptions = customers?.map((c) => ({ value: String(c.id), label: c.company_name ? `${c.name} (${c.company_name})` : c.name })) ?? [];
  const productOptions = (productsData?.data ?? []).map((p) => ({ value: String(p.id), label: `${p.name} (${p.sku})` }));

  async function handleFormSubmit(values: OrderFormValues) {
    setFormError(null);
    try {
      await onSubmit({
        customer_id: Number(values.customer_id),
        priority: values.priority,
        pickup_address: values.pickup_address || null,
        pickup_city: values.pickup_city || null,
        delivery_address: values.delivery_address,
        delivery_city: values.delivery_city || null,
        requested_at: values.requested_at || null,
        notes: values.notes || null,
        items: values.items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: item.quantity,
          unit_price: item.unit_price === "" ? null : Number(item.unit_price),
        })),
      });
    } catch (error) {
      const message = applyApiErrorsToForm(error, setError);
      if (message) setFormError(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <ErrorBanner error={formError} />

      <FieldGroup>
        <Select label="Customer" required placeholder="Select a customer" options={customerOptions} error={errors.customer_id?.message} {...register("customer_id")} />
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
      </FieldGroup>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-sm font-medium text-ink">Pickup (optional)</p>
        <FieldGroup>
          <Input label="Pickup address" error={errors.pickup_address?.message} {...register("pickup_address")} />
          <Input label="Pickup city" error={errors.pickup_city?.message} {...register("pickup_city")} />
        </FieldGroup>
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-sm font-medium text-ink">Delivery</p>
        <FieldGroup>
          <Input label="Delivery address" required error={errors.delivery_address?.message} {...register("delivery_address")} />
          <Input label="Delivery city" error={errors.delivery_city?.message} {...register("delivery_city")} />
        </FieldGroup>
        <div className="mt-4">
          <Input label="Requested date" type="datetime-local" error={errors.requested_at?.message} {...register("requested_at")} />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-ink">Order items</p>
          <Button type="button" size="sm" variant="outline" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => append({ product_id: "", quantity: 1, unit_price: "" })}>
            Add item
          </Button>
        </div>
        {errors.items?.message && <p className="text-xs text-danger mb-2">{errors.items.message}</p>}
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2 rounded-control border border-border p-3">
              <div className="flex-1">
                <Select
                  label={index === 0 ? "Product" : undefined}
                  placeholder="Select a product"
                  options={productOptions}
                  error={errors.items?.[index]?.product_id?.message}
                  {...register(`items.${index}.product_id`)}
                />
              </div>
              <div className="w-24">
                <Input
                  label={index === 0 ? "Qty" : undefined}
                  type="number"
                  min={1}
                  error={errors.items?.[index]?.quantity?.message}
                  {...register(`items.${index}.quantity`)}
                />
              </div>
              <div className="w-32">
                <Input
                  label={index === 0 ? "Unit price" : undefined}
                  type="number"
                  step="0.01"
                  min={0}
                  error={errors.items?.[index]?.unit_price?.message}
                  {...register(`items.${index}.unit_price`)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger-bg"
                onClick={() => fields.length > 1 && remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Textarea label="Notes" error={errors.notes?.message} {...register("notes")} />

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          Create order
        </Button>
      </div>
    </form>
  );
}
