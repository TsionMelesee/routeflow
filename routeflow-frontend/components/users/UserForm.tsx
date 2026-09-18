"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, ErrorBanner, FieldGroup, Input, Select } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import { useRoles } from "@/hooks/use-roles";
import type { User } from "@/lib/types";

const createSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Must be at least 8 characters"),
  phone: z.string().max(50).optional().or(z.literal("")),
  role_slugs: z.array(z.string()).min(1, "Select at least one role"),
});
const updateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  phone: z.string().max(50).optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  role_slugs: z.array(z.string()).min(1, "Select at least one role"),
});

export type UserCreateValues = z.infer<typeof createSchema>;
export type UserUpdateValues = z.infer<typeof updateSchema>;

function RoleCheckboxes({ value, onChange }: { value: string[]; onChange: (slugs: string[]) => void }) {
  const { data: roles } = useRoles();
  return (
    <div>
      <p className="text-sm font-medium text-ink mb-1.5">
        Roles<span className="text-danger ml-0.5">*</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {(roles ?? []).map((role) => {
          const checked = value.includes(role.slug);
          return (
            <label
              key={role.slug}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm cursor-pointer ${
                checked ? "border-brand-300 bg-brand-50 text-brand-700" : "border-border text-ink hover:bg-canvas"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked ? [...value, role.slug] : value.filter((s) => s !== role.slug))}
                className="sr-only"
              />
              {role.name}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function UserCreateForm({ onSubmit, onCancel }: { onSubmit: (values: UserCreateValues) => Promise<void>; onCancel?: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserCreateValues>({ resolver: zodResolver(createSchema), defaultValues: { role_slugs: [] } });

  async function handleFormSubmit(values: UserCreateValues) {
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
        <Input label="Full name" required error={errors.name?.message} {...register("name")} />
        <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
      </FieldGroup>
      <FieldGroup>
        <Input label="Email" type="email" required error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" required hint="At least 8 characters." error={errors.password?.message} {...register("password")} />
      </FieldGroup>
      <Controller
        control={control}
        name="role_slugs"
        render={({ field }) => <RoleCheckboxes value={field.value} onChange={field.onChange} />}
      />
      {errors.role_slugs?.message && <p className="text-xs text-danger">{errors.role_slugs.message}</p>}
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          Create user
        </Button>
      </div>
    </form>
  );
}

export function UserEditForm({ user, onSubmit, onCancel }: { user: User; onSubmit: (values: UserUpdateValues) => Promise<void>; onCancel?: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserUpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: { name: user.name, phone: user.phone ?? "", status: user.status, role_slugs: user.roles ?? [] },
  });

  async function handleFormSubmit(values: UserUpdateValues) {
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
        <Input label="Full name" required error={errors.name?.message} {...register("name")} />
        <Input label="Phone" error={errors.phone?.message} {...register("phone")} />
      </FieldGroup>
      <Select
        label="Status"
        options={[
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "suspended", label: "Suspended" },
        ]}
        error={errors.status?.message}
        {...register("status")}
      />
      <Controller
        control={control}
        name="role_slugs"
        render={({ field }) => <RoleCheckboxes value={field.value} onChange={field.onChange} />}
      />
      {errors.role_slugs?.message && <p className="text-xs text-danger">{errors.role_slugs.message}</p>}
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
