"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Modal, Button, ErrorBanner, Input, Select } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import { useAvailableDrivers } from "@/hooks/use-drivers";
import { useAvailableVehicles } from "@/hooks/use-vehicles";
import { useAssignDelivery } from "@/hooks/use-deliveries";

const schema = z.object({
  driver_id: z.string().min(1, "Choose a driver"),
  vehicle_id: z.string().min(1, "Choose a vehicle"),
  scheduled_at: z.string().optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export function AssignDeliveryModal({ deliveryId, open, onClose }: { deliveryId: number; open: boolean; onClose: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const { data: driversData } = useAvailableDrivers();
  const { data: vehiclesData } = useAvailableVehicles();
  const assignDelivery = useAssignDelivery(deliveryId);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await assignDelivery.mutateAsync({
        driver_id: Number(values.driver_id),
        vehicle_id: Number(values.vehicle_id),
        scheduled_at: values.scheduled_at || null,
      });
      toast.success("Delivery assigned.");
      reset();
      onClose();
    } catch (error) {
      const message = applyApiErrorsToForm(error, setError);
      if (message) setFormError(message);
    }
  }

  const driverOptions = (driversData?.data ?? []).map((d) => ({ value: String(d.id), label: d.name ?? `Driver #${d.id}` }));
  const vehicleOptions = (vehiclesData?.data ?? []).map((v) => ({ value: String(v.id), label: `${v.plate_number}${v.model ? ` — ${v.model}` : ""}` }));

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Assign delivery"
      description="Choose an available driver and vehicle."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
            Assign
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <ErrorBanner error={formError} />
        <Select
          label="Driver"
          required
          options={driverOptions}
          placeholder={driverOptions.length === 0 ? "No available drivers" : "Select a driver"}
          error={errors.driver_id?.message}
          {...register("driver_id")}
        />
        <Select
          label="Vehicle"
          required
          options={vehicleOptions}
          placeholder={vehicleOptions.length === 0 ? "No available vehicles" : "Select a vehicle"}
          error={errors.vehicle_id?.message}
          {...register("vehicle_id")}
        />
        <Input label="Scheduled time" type="datetime-local" error={errors.scheduled_at?.message} {...register("scheduled_at")} />
      </form>
    </Modal>
  );
}
