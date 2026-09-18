"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { Button, Input, ErrorBanner } from "@/components/ui";
import { applyApiErrorsToForm } from "@/lib/forms";

const schema = z
  .object({
    password: z.string().min(8, "Must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
  });
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    if (!token || !email) {
      setFormError("This reset link is invalid or has expired. Please request a new one.");
      return;
    }
    try {
      await authApi.resetPassword({ token, email, ...values });
      toast.success("Password reset — sign in with your new password.");
      router.push("/login");
    } catch (error) {
      const message = applyApiErrorsToForm(error, setError);
      if (message) setFormError(message);
    }
  }

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink">Set a new password</h1>
      <p className="mt-1 text-sm text-neutral">
        {email ? (
          <>
            For <span className="font-medium text-ink">{email}</span>
          </>
        ) : (
          "Enter a new password for your account."
        )}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <ErrorBanner error={formError} />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          error={errors.password_confirmation?.message}
          {...register("password_confirmation")}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Reset password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral">
        <Link href="/login" className="font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}