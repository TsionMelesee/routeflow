"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader, Card, CardBody, Breadcrumbs } from "@/components/ui";
import { WarehouseForm, type WarehouseFormValues } from "@/components/warehouses/WarehouseForm";
import { useCreateWarehouse } from "@/hooks/use-warehouses";

export default function CreateWarehousePage() {
  const router = useRouter();
  const createWarehouse = useCreateWarehouse();

  async function handleSubmit(values: WarehouseFormValues) {
    const result = await createWarehouse.mutateAsync({
      ...values,
      manager_id: values.manager_id ? Number(values.manager_id) : null,
    });
    toast.success("Warehouse created.");
    router.push(`/warehouses/${result.data.id}`);
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Warehouses", href: "/warehouses" }, { label: "New warehouse" }]} />
      <PageHeader title="Add warehouse" description="Add a new warehouse location." />
      <Card className="max-w-2xl">
        <CardBody>
          <WarehouseForm onSubmit={handleSubmit} onCancel={() => router.back()} submitLabel="Create warehouse" />
        </CardBody>
      </Card>
    </div>
  );
}
