"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { inventoryApi } from "@/lib/api/inventory";
import { useAllWarehouses } from "@/hooks/use-warehouses";
import { useProducts } from "@/hooks/use-products";
import { applyApiErrorsToForm } from "@/lib/forms";
import { Breadcrumbs, Button, Card, CardBody, ErrorBanner, FieldGroup, Input, PageHeader, Select, Textarea } from "@/components/ui";

const schema = z
  .object({
    product_id: z.string().min(1, "Choose a product"),
    from_warehouse_id: z.string().min(1, "Choose a source warehouse"),
    to_warehouse_id: z.string().min(1, "Choose a destination warehouse"),
    quantity: z.coerce.number().int().positive("Must be greater than zero"),
    notes: z.string().max(500).optional().or(z.literal("")),
  })
  .refine((data) => data.from_warehouse_id !== data.to_warehouse_id, {
    message: "Source and destination must be different",
    path: ["to_warehouse_id"],
  });
type FormValues = z.infer<typeof schema>;

export default function TransferInventoryPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const { data: warehousesData } = useAllWarehouses();
  const { data: productsData } = useProducts({ per_page: 100 });

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [fromId, toId] = [watch("from_warehouse_id"), watch("to_warehouse_id")];
  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: String(w.id), label: w.name }));
  const productOptions = (productsData?.data ?? []).map((p) => ({ value: String(p.id), label: `${p.name} (${p.sku})` }));

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await inventoryApi.transfer({
        product_id: Number(values.product_id),
        from_warehouse_id: Number(values.from_warehouse_id),
        to_warehouse_id: Number(values.to_warehouse_id),
        quantity: values.quantity,
        notes: values.notes || undefined,
      });
      toast.success("Stock transferred.");
      router.push(`/inventory?warehouse=${values.to_warehouse_id}`);
    } catch (error) {
      const message = applyApiErrorsToForm(error, setError);
      if (message) setFormError(message);
    }
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Inventory", href: "/inventory" }, { label: "Transfer" }]} />
      <PageHeader title="Transfer stock" description="Move stock from one warehouse to another." />

      <Card className="max-w-2xl">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <ErrorBanner error={formError} />

            <Select label="Product" required options={productOptions} placeholder="Select a product" error={errors.product_id?.message} {...register("product_id")} />

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Select
                  label="From warehouse"
                  required
                  options={warehouseOptions}
                  placeholder="Source"
                  error={errors.from_warehouse_id?.message}
                  {...register("from_warehouse_id")}
                />
              </div>
              <ArrowRight className="h-4 w-4 text-neutral mb-2.5 shrink-0" />
              <div className="flex-1">
                <Select
                  label="To warehouse"
                  required
                  options={warehouseOptions.filter((w) => w.value !== fromId)}
                  placeholder="Destination"
                  error={errors.to_warehouse_id?.message}
                  {...register("to_warehouse_id")}
                />
              </div>
            </div>
            {fromId && toId && fromId === toId && (
              <p className="text-xs text-danger -mt-2">Source and destination must be different.</p>
            )}

            <Input label="Quantity" type="number" min={1} required error={errors.quantity?.message} {...register("quantity")} />
            <Textarea label="Notes" placeholder="Reason for transfer…" error={errors.notes?.message} {...register("notes")} />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Transfer stock
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
