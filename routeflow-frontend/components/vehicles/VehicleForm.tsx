"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, ErrorBanner, FieldGroup, Input, Select } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import type { Vehicle } from "@/lib/types";

const schema = z.object({
  plate_number: z.string().min(1, "Plate number is required").max(50),
  type: z.string().max(100).optional().or(z.literal("")),
  model: z.string().max(100).optional().or(z.literal("")),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1).optional().or(z.literal("")),
  capacity: z.coerce.number().min(0).optional().or(z.literal("")),
  status: z.enum(["available", "in_use", "maintenance", "inactive"]).optional(),
});
export type VehicleFormValues = z.infer<typeof schema>;

const TYPE_OPTIONS = [
  { value: "van", label: "Van" },
  { value: "truck", label: "Truck" },
  { value: "motorcycle", label: "Motorcycle" },
];
const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "in_use", label: "In use" },
  { value: "maintenance", label: "Maintenance" },
  { value: "inactive", label: "Inactive" },
];

export function VehicleForm({
  vehicle,
  onSubmit,
  onCancel,
  submitLabel = "Save vehicle",
}: {
  vehicle?: Vehicle;
  onSubmit: (values: VehicleFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: vehicle
      ? {
          plate_number: vehicle.plate_number,
          type: vehicle.type ?? "",
          model: vehicle.model ?? "",
          year: vehicle.year ?? undefined,
          capacity: vehicle.capacity ?? undefined,
          status: vehicle.status,
        }
      : { status: "available" },
  });

  async function handleFormSubmit(values: VehicleFormValues) {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message = applyApiErrorsToForm(error, setError);
      if (message) setFormError(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <ErrorBanner error={formError} />
      <FieldGroup>
        <Input label="Plate number" required error={errors.plate_number?.message} {...register("plate_number")} />
        <Select label="Type" placeholder="Select a type" options={TYPE_OPTIONS} error={errors.type?.message} {...register("type")} />
      </FieldGroup>
      <FieldGroup>
        <Input label="Model" error={errors.model?.message} {...register("model")} />
        <Input label="Year" type="number" error={errors.year?.message} {...register("year")} />
      </FieldGroup>
      <FieldGroup>
        <Input label="Capacity (kg)" type="number" step="0.01" error={errors.capacity?.message} {...register("capacity")} />
        {vehicle && <Select label="Status" options={STATUS_OPTIONS} error={errors.status?.message} {...register("status")} />}
      </FieldGroup>
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
