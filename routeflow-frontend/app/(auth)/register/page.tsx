"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { Button, Input, ErrorBanner, FieldGroup } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";

const schema = z
  .object({
    organization_name: z.string().min(1, "Organization name is required").max(255),
    organization_slug: z
      .string()
      .min(1, "URL slug is required")
      .max(255)
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
    admin_name: z.string().min(1, "Your name is required").max(255),
    admin_email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    admin_password: z.string().min(8, "Must be at least 8 characters"),
    admin_password_confirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.admin_password === data.admin_password_confirmation, {
    message: "Passwords don't match",
    path: ["admin_password_confirmation"],
  });
type FormValues = z.infer<typeof schema>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function RegisterPage() {
  const { register: registerOrganization } = useAuth();
  const router = useRouter();
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

  const orgName = watch("organization_name");

  function handleOrgNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue("organization_name", e.target.value);
    if (!slugTouched) {
      setValue("organization_slug", slugify(e.target.value));
    }
  }

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await registerOrganization(values);
      toast.success("Organization created — welcome to RouteFlow.");
      router.push("/dashboard");
    } catch (error) {
      const message = applyApiErrorsToForm(error, setError);
      if (message) setFormError(message);
    }
  }

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink">Create your organization</h1>
      <p className="mt-1 text-sm text-neutral">Set up RouteFlow for your logistics team.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <ErrorBanner error={formError} />

        <Input
          label="Organization name"
          required
          error={errors.organization_name?.message}
          {...register("organization_name")}
          value={orgName ?? ""}
          onChange={handleOrgNameChange}
        />
        <Input
          label="Organization URL slug"
          required
          hint="Used to identify your organization — lowercase letters, numbers, hyphens."
          error={errors.organization_slug?.message}
          {...register("organization_slug", {
            onChange: () => setSlugTouched(true),
          })}
        />

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm font-medium text-ink">Your admin account</p>
          <div className="space-y-4">
            <Input label="Full name" required error={errors.admin_name?.message} {...register("admin_name")} />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              required
              error={errors.admin_email?.message}
              {...register("admin_email")}
            />
            <FieldGroup>
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                required
                error={errors.admin_password?.message}
                {...register("admin_password")}
              />
              <Input
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                required
                error={errors.admin_password_confirmation?.message}
                {...register("admin_password_confirmation")}
              />
            </FieldGroup>
          </div>
        </div>

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create organization
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
