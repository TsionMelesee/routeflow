"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, ErrorBanner, FieldGroup, Input, Select, Textarea } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import type { Customer } from "@/lib/types";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  company_name: z.string().max(255).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(255).optional().or(z.literal("")),
  country: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional(),
});
export type CustomerFormValues = z.infer<typeof schema>;

export interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function CustomerForm({ customer, onSubmit, onCancel, submitLabel = "Save customer" }: CustomerFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: customer
      ? {
          name: customer.name,
          company_name: customer.company_name ?? "",
          email: customer.email ?? "",
          phone: customer.phone ?? "",
          address: customer.address ?? "",
          city: customer.city ?? "",
          country: customer.country ?? "",
          notes: customer.notes ?? "",
          status: customer.status,
        }
      : { status: "active" },
  });

  async function handleFormSubmit(values: CustomerFormValues) {
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
        <Input label="Name" required error={errors.name?.message} {...register("name")} />
        <Input label="Company" error={errors.company_name?.message} {...register("company_name")} />
      </FieldGroup>
      <FieldGroup>
        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
      </FieldGroup>
      <Input label="Address" error={errors.address?.message} {...register("address")} />
      <FieldGroup>
        <Input label="City" error={errors.city?.message} {...register("city")} />
        <Input label="Country" error={errors.country?.message} {...register("country")} />
      </FieldGroup>
      {customer && (
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
      <Textarea label="Notes" error={errors.notes?.message} {...register("notes")} />
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
