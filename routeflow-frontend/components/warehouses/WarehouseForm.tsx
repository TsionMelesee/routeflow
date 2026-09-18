"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, ErrorBanner, FieldGroup, Input, Select } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import { useAllUsers } from "@/hooks/use-users";
import type { Warehouse } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  code: z.string().min(1, "Code is required").max(50),
  address: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(255).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  manager_id: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
export type WarehouseFormValues = z.infer<typeof schema>;

export interface WarehouseFormProps {
  warehouse?: Warehouse;
  onSubmit: (values: WarehouseFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function WarehouseForm({ warehouse, onSubmit, onCancel, submitLabel = "Save warehouse" }: WarehouseFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const { data: usersData } = useAllUsers();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: warehouse
      ? {
          name: warehouse.name,
          code: warehouse.code,
          address: warehouse.address ?? "",
          city: warehouse.city ?? "",
          phone: warehouse.phone ?? "",
          manager_id: warehouse.manager?.id ? String(warehouse.manager.id) : "",
          status: warehouse.status,
        }
      : { status: "active" },
  });

  async function handleFormSubmit(values: WarehouseFormValues) {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const message = applyApiErrorsToForm(error, setError);
      if (message) setFormError(message);
    }
  }

  const managerOptions = (usersData?.data ?? []).map((u) => ({ value: String(u.id), label: u.name }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <ErrorBanner error={formError} />
      <FieldGroup>
        <Input label="Name" required error={errors.name?.message} {...register("name")} />
        <Input label="Code" required hint="A short unique code, e.g. WH-ADD-01" error={errors.code?.message} {...register("code")} />
      </FieldGroup>
      <Input label="Address" error={errors.address?.message} {...register("address")} />
      <FieldGroup>
        <Input label="City" error={errors.city?.message} {...register("city")} />
        <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
      </FieldGroup>
      <FieldGroup>
        <Select label="Manager" placeholder="No manager assigned" options={managerOptions} error={errors.manager_id?.message} {...register("manager_id")} />
        {warehouse && (
          <Select
            label="Status"
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            error={errors.status?.message}
            {...register("status")}
          />
        )}
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
