"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader, Card, CardBody, Breadcrumbs } from "@/components/ui";
import { OrderForm } from "@/components/orders/OrderForm";
import { useCreateOrder } from "@/hooks/use-orders";
import type { CreateOrderPayload } from "@/lib/api/orders";

export default function CreateOrderPage() {
  const router = useRouter();
  const createOrder = useCreateOrder();

  async function handleSubmit(payload: CreateOrderPayload) {
    const result = await createOrder.mutateAsync(payload);
    toast.success("Order created.");
    router.push(`/orders/${result.data.id}`);
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Orders", href: "/orders" }, { label: "New order" }]} />
      <PageHeader title="Create order" description="Place a new order for a customer." />
      <Card className="max-w-3xl">
        <CardBody>
          <OrderForm onSubmit={handleSubmit} onCancel={() => router.back()} />
        </CardBody>
      </Card>
    </div>
  );
}
