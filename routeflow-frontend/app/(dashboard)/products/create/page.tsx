"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader, Card, CardBody, Breadcrumbs } from "@/components/ui";
import { ProductForm, type ProductFormValues } from "@/components/products/ProductForm";
import { useCreateProduct } from "@/hooks/use-products";

export default function CreateProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  async function handleSubmit(values: ProductFormValues) {
    const result = await createProduct.mutateAsync({
      ...values,
      weight: values.weight === "" ? null : Number(values.weight),
    });
    toast.success("Product created.");
    router.push(`/products/${result.data.id}`);
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Products", href: "/products" }, { label: "New product" }]} />
      <PageHeader title="Add product" description="Add a new product to your catalog." />
      <Card className="max-w-2xl">
        <CardBody>
          <ProductForm onSubmit={handleSubmit} onCancel={() => router.back()} submitLabel="Create product" />
        </CardBody>
      </Card>
    </div>
  );
}
