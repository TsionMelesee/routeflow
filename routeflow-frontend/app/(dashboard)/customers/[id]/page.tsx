"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Mail, MapPin, Phone, Trash2, Pencil, ShoppingBag } from "lucide-react";
import { useCustomer, useDeleteCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import {
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  Modal,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { CustomerForm, type CustomerFormValues } from "@/components/customers/CustomerForm";
import { formatDate } from "@/lib/utils";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const customerId = Number(id);
  const router = useRouter();
  const { data: customer, isLoading, error, refetch } = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer(customerId);
  const deleteCustomer = useDeleteCustomer();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  if (isLoading) return <LoadingState label="Loading customer…" />;
  if (error || !customer) return <ErrorState error={error} onRetry={() => refetch()} />;

  async function handleUpdate(values: CustomerFormValues) {
    await updateCustomer.mutateAsync(values);
    toast.success("Customer updated.");
    setEditOpen(false);
  }

  async function handleDelete() {
    try {
      await deleteCustomer.mutateAsync(customerId);
      toast.success("Customer deleted.");
      router.push("/customers");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete this customer.");
      setConfirmDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Customers", href: "/customers" }, { label: customer.name }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-display font-semibold">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-ink">{customer.name}</h1>
              <StatusBadge status={customer.status} />
            </div>
            {customer.company_name && <p className="text-sm text-neutral">{customer.company_name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="outline" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total orders" value={customer.orders_count ?? 0} icon={ShoppingBag} tone="brand" />
        <StatCard label="Customer since" value={formatDate(customer.created_at)} icon={Building2} tone="info" />
        <StatCard label="Status" value={customer.status === "active" ? "Active" : "Inactive"} tone={customer.status === "active" ? "success" : "danger"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Contact information" />
          <CardBody className="space-y-3">
            <InfoRow icon={Mail} label="Email" value={customer.email} />
            <InfoRow icon={Phone} label="Phone" value={customer.phone} />
            <InfoRow
              icon={MapPin}
              label="Address"
              value={[customer.address, customer.city, customer.country].filter(Boolean).join(", ") || null}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Notes" />
          <CardBody>
            <p className="text-sm text-ink whitespace-pre-wrap">{customer.notes || "No notes yet."}</p>
          </CardBody>
        </Card>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit customer" size="lg">
        <CustomerForm customer={customer} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} submitLabel="Save changes" />
      </Modal>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this customer?"
        description={`This will permanently remove ${customer.name}.`}
        confirmLabel="Delete customer"
        variant="danger"
        loading={deleteCustomer.isPending}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-neutral shrink-0" />
      <div>
        <p className="text-xs text-neutral">{label}</p>
        <p className="text-sm text-ink">{value || "—"}</p>
      </div>
    </div>
  );
}
