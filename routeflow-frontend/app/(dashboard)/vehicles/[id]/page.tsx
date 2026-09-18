"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Gauge, Pencil, Tag, Trash2 } from "lucide-react";
import { useDeleteVehicle, useUpdateVehicle, useVehicle } from "@/hooks/use-vehicles";
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
import { VehicleForm, type VehicleFormValues } from "@/components/vehicles/VehicleForm";
import { titleCase } from "@/lib/utils";

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const vehicleId = Number(id);
  const router = useRouter();
  const { data: vehicle, isLoading, error, refetch } = useVehicle(vehicleId);
  const updateVehicle = useUpdateVehicle(vehicleId);
  const deleteVehicle = useDeleteVehicle();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  if (isLoading) return <LoadingState label="Loading vehicle…" />;
  if (error || !vehicle) return <ErrorState error={error} onRetry={() => refetch()} />;

  async function handleUpdate(values: VehicleFormValues) {
    await updateVehicle.mutateAsync({
      ...values,
      year: values.year === "" ? null : Number(values.year),
      capacity: values.capacity === "" ? null : Number(values.capacity),
    });
    toast.success("Vehicle updated.");
    setEditOpen(false);
  }

  async function handleDelete() {
    try {
      await deleteVehicle.mutateAsync(vehicleId);
      toast.success("Vehicle removed.");
      router.push("/vehicles");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove this vehicle.");
      setConfirmDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Vehicles", href: "/vehicles" }, { label: vehicle.plate_number }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-ink">{vehicle.plate_number}</h1>
            <StatusBadge status={vehicle.status} />
          </div>
          <p className="text-sm text-neutral mt-0.5">{vehicle.model || "No model on file"}</p>
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
        <StatCard label="Type" value={vehicle.type ? titleCase(vehicle.type) : "—"} icon={Tag} tone="brand" />
        <StatCard label="Capacity" value={vehicle.capacity ? `${vehicle.capacity} kg` : "—"} icon={Gauge} tone="info" />
        <StatCard label="Year" value={vehicle.year ?? "—"} tone="brand" />
      </div>

      <Card>
        <CardHeader title="Vehicle details" />
        <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Plate number" value={vehicle.plate_number} mono />
          <Field label="Model" value={vehicle.model} />
          <Field label="Type" value={vehicle.type ? titleCase(vehicle.type) : null} />
        </CardBody>
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit vehicle" size="lg">
        <VehicleForm vehicle={vehicle} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} submitLabel="Save changes" />
      </Modal>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove this vehicle?"
        description={`This will permanently remove ${vehicle.plate_number}.`}
        confirmLabel="Remove vehicle"
        variant="danger"
        loading={deleteVehicle.isPending}
      />
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string | number | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-neutral">{label}</p>
      <p className={mono ? "text-sm text-ink font-mono" : "text-sm text-ink"}>{value ?? "—"}</p>
    </div>
  );
}
