"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader, Card, CardBody, Breadcrumbs } from "@/components/ui";
import { CustomerForm, type CustomerFormValues } from "@/components/customers/CustomerForm";
import { useCreateCustomer } from "@/hooks/use-customers";

export default function CreateCustomerPage() {
  const router = useRouter();
  const createCustomer = useCreateCustomer();

  async function handleSubmit(values: CustomerFormValues) {
    const result = await createCustomer.mutateAsync(values);
    toast.success("Customer created.");
    router.push(`/customers/${result.data.id}`);
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Customers", href: "/customers" }, { label: "New customer" }]} />
      <PageHeader title="Add customer" description="Create a new customer to place orders for." />
      <Card className="max-w-2xl">
        <CardBody>
          <CustomerForm onSubmit={handleSubmit} onCancel={() => router.back()} submitLabel="Create customer" />
        </CardBody>
      </Card>
    </div>
  );
}
