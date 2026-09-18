"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader, Card, CardBody, Breadcrumbs } from "@/components/ui";
import { DriverCreateForm, type DriverCreateValues } from "@/components/drivers/DriverForm";
import { useCreateDriver } from "@/hooks/use-drivers";

export default function CreateDriverPage() {
  const router = useRouter();
  const createDriver = useCreateDriver();

  async function handleSubmit(values: DriverCreateValues) {
    const result = await createDriver.mutateAsync({
      ...values,
      license_expiry: values.license_expiry || null,
    });
    toast.success("Driver created.");
    router.push(`/drivers/${result.data.id}`);
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Drivers", href: "/drivers" }, { label: "New driver" }]} />
      <PageHeader title="Add driver" description="Create a driver account and license record." />
      <Card className="max-w-2xl">
        <CardBody>
          <DriverCreateForm onSubmit={handleSubmit} onCancel={() => router.back()} />
        </CardBody>
      </Card>
    </div>
  );
}
