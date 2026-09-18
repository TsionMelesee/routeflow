"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader, Card, CardBody, Breadcrumbs } from "@/components/ui";
import { VehicleForm, type VehicleFormValues } from "@/components/vehicles/VehicleForm";
import { useCreateVehicle } from "@/hooks/use-vehicles";

export default function CreateVehiclePage() {
  const router = useRouter();
  const createVehicle = useCreateVehicle();

  async function handleSubmit(values: VehicleFormValues) {
    const result = await createVehicle.mutateAsync({
      ...values,
      year: values.year === "" ? null : Number(values.year),
      capacity: values.capacity === "" ? null : Number(values.capacity),
    });
    toast.success("Vehicle created.");
    router.push(`/vehicles/${result.data.id}`);
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Vehicles", href: "/vehicles" }, { label: "New vehicle" }]} />
      <PageHeader title="Add vehicle" description="Add a new vehicle to your fleet." />
      <Card className="max-w-2xl">
        <CardBody>
          <VehicleForm onSubmit={handleSubmit} onCancel={() => router.back()} submitLabel="Create vehicle" />
        </CardBody>
      </Card>
    </div>
  );
}
