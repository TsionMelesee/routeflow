"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Pencil, Phone, ShieldCheck, Trash2, Truck } from "lucide-react";
import { useDeleteDriver, useDriver, useUpdateDriver } from "@/hooks/use-drivers";
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
import { DriverEditForm, type DriverUpdateValues } from "@/components/drivers/DriverForm";
import { formatDate } from "@/lib/utils";

export default function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const driverId = Number(id);
  const router = useRouter();
  const { data: driver, isLoading, error, refetch } = useDriver(driverId);
  const updateDriver = useUpdateDriver(driverId);
  const deleteDriver = useDeleteDriver();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  if (isLoading) return <LoadingState label="Loading driver…" />;
  if (error || !driver) return <ErrorState error={error} onRetry={() => refetch()} />;

  async function handleUpdate(values: DriverUpdateValues) {
    await updateDriver.mutateAsync({ ...values, license_expiry: values.license_expiry || null });
    toast.success("Driver updated.");
    setEditOpen(false);
  }

  async function handleDelete() {
    try {
      await deleteDriver.mutateAsync(driverId);
      toast.success("Driver removed.");
      router.push("/drivers");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove this driver.");
      setConfirmDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Drivers", href: "/drivers" }, { label: driver.name ?? `Driver #${driver.id}` }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-display font-semibold">
            {(driver.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-ink">{driver.name}</h1>
              <StatusBadge status={driver.status} />
            </div>
            <p className="text-sm text-neutral">{driver.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="outline" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDeleteOpen(true)}>
            Remove
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active deliveries" value={driver.active_deliveries_count ?? 0} icon={Truck} tone="info" />
        <StatCard label="License expires" value={formatDate(driver.license_expiry)} icon={ShieldCheck} tone="brand" />
        <StatCard label="Status" value={driver.status === "available" ? "Available" : driver.status.replace(/_/g, " ")} tone={driver.status === "available" ? "success" : "neutral"} />
      </div>

      <Card>
        <CardHeader title="Contact & license" />
        <CardBody className="space-y-3">
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 mt-0.5 text-neutral shrink-0" />
            <div>
              <p className="text-xs text-neutral">Email</p>
              <p className="text-sm text-ink">{driver.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 mt-0.5 text-neutral shrink-0" />
            <div>
              <p className="text-xs text-neutral">Phone</p>
              <p className="text-sm text-ink">{driver.phone || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 mt-0.5 text-neutral shrink-0" />
            <div>
              <p className="text-xs text-neutral">License number</p>
              <p className="text-sm text-ink font-mono">{driver.license_number}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit driver" size="lg">
        <DriverEditForm driver={driver} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove this driver?"
        description={`This will permanently remove ${driver.name}.`}
        confirmLabel="Remove driver"
        variant="danger"
        loading={deleteDriver.isPending}
      />
    </div>
  );
}
