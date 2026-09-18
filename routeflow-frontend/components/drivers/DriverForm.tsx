"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, ErrorBanner, FieldGroup, Input, Select } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import type { Driver } from "@/lib/types";

const createSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Must be at least 8 characters"),
  phone: z.string().max(50).optional().or(z.literal("")),
  license_number: z.string().min(1, "License number is required").max(100),
  license_expiry: z.string().optional().or(z.literal("")),
});
const updateSchema = z.object({
  license_number: z.string().min(1, "License number is required").max(100),
  license_expiry: z.string().optional().or(z.literal("")),
  status: z.enum(["available", "on_delivery", "off_duty", "suspended"]).optional(),
});

export type DriverCreateValues = z.infer<typeof createSchema>;
export type DriverUpdateValues = z.infer<typeof updateSchema>;

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "on_delivery", label: "On delivery" },
  { value: "off_duty", label: "Off duty" },
  { value: "suspended", label: "Suspended" },
];

export function DriverCreateForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: DriverCreateValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DriverCreateValues>({ resolver: zodResolver(createSchema) });

  async function handleFormSubmit(values: DriverCreateValues) {
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
      <p className="text-sm font-medium text-ink">Driver account</p>
      <FieldGroup>
        <Input label="Full name" required error={errors.name?.message} {...register("name")} />
        <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
      </FieldGroup>
      <FieldGroup>
        <Input label="Email" type="email" required error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" required hint="At least 8 characters." error={errors.password?.message} {...register("password")} />
      </FieldGroup>
      <div className="border-t border-border pt-4">
        <p className="mb-3 text-sm font-medium text-ink">License</p>
        <FieldGroup>
          <Input label="License number" required error={errors.license_number?.message} {...register("license_number")} />
          <Input label="License expiry" type="date" error={errors.license_expiry?.message} {...register("license_expiry")} />
        </FieldGroup>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          Create driver
        </Button>
      </div>
    </form>
  );
}

export function DriverEditForm({
  driver,
  onSubmit,
  onCancel,
}: {
  driver: Driver;
  onSubmit: (values: DriverUpdateValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DriverUpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      license_number: driver.license_number,
      license_expiry: driver.license_expiry ?? "",
      status: driver.status,
    },
  });

  async function handleFormSubmit(values: DriverUpdateValues) {
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
        <Input label="License number" required error={errors.license_number?.message} {...register("license_number")} />
        <Input label="License expiry" type="date" error={errors.license_expiry?.message} {...register("license_expiry")} />
      </FieldGroup>
      <Select label="Status" options={STATUS_OPTIONS} error={errors.status?.message} {...register("status")} />
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
