"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, ErrorBanner, FieldGroup, Input, Select, Textarea } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import type { Product } from "@/lib/types";

const schema = z.object({
  sku: z.string().min(1, "SKU is required").max(100),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(2000).optional().or(z.literal("")),
  weight: z.coerce.number().min(0, "Must be zero or more").optional().or(z.literal("")),
  low_stock_threshold: z.coerce.number().int().min(0, "Must be zero or more").optional(),
  status: z.enum(["active", "inactive", "discontinued"]).optional(),
});
export type ProductFormValues = z.infer<typeof schema>;

export interface ProductFormProps {
  product?: Product;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ProductForm({ product, onSubmit, onCancel, submitLabel = "Save product" }: ProductFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          sku: product.sku,
          name: product.name,
          description: product.description ?? "",
          weight: product.weight ?? undefined,
          low_stock_threshold: product.low_stock_threshold,
          status: product.status,
        }
      : { status: "active", low_stock_threshold: 10 },
  });

  async function handleFormSubmit(values: ProductFormValues) {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message = applyApiErrorsToForm(error, setError);
      if (message) setFormError(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <ErrorBanner error={formError} />
      <FieldGroup>
        <Input label="SKU" required error={errors.sku?.message} {...register("sku")} />
        <Input label="Name" required error={errors.name?.message} {...register("name")} />
      </FieldGroup>
      <Textarea label="Description" error={errors.description?.message} {...register("description")} />
      <FieldGroup>
        <Input
          label="Weight (kg)"
          type="number"
          step="0.01"
          error={errors.weight?.message}
          {...register("weight")}
        />
        <Input
          label="Low stock threshold"
          type="number"
          hint="Alert when quantity at a warehouse drops to this level."
          error={errors.low_stock_threshold?.message}
          {...register("low_stock_threshold")}
        />
      </FieldGroup>
      {product && (
        <Select
          label="Status"
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "discontinued", label: "Discontinued" },
          ]}
          error={errors.status?.message}
          {...register("status")}
        />
      )}
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
