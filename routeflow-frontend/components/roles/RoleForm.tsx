"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, ErrorBanner, FieldGroup, Input, Textarea } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";
import type { RolePayload } from "@/lib/api/roles";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().max(500).optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function RoleForm({ onSubmit, onCancel }: { onSubmit: (payload: RolePayload) => Promise<void>; onCancel?: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const name = watch("name");

  async function handleFormSubmit(values: FormValues) {
    setFormError(null);
    try {
      await onSubmit({ name: values.name, slug: values.slug, description: values.description || null });
    } catch (error) {
      const message = applyApiErrorsToForm(error, setError);
      if (message) setFormError(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <ErrorBanner error={formError} />
      <Input
        label="Role name"
        required
        error={errors.name?.message}
        {...register("name", {
          onChange: (e) => {
            if (!slugTouched) setValue("slug", slugify(e.target.value));
          },
        })}
      />
      <Input
        label="Slug"
        required
        hint="Used as the permanent identifier for this role."
        error={errors.slug?.message}
        {...register("slug", { onChange: () => setSlugTouched(true) })}
      />
      <Textarea label="Description" error={errors.description?.message} {...register("description")} />
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          Create role
        </Button>
      </div>
    </form>
  );
}
