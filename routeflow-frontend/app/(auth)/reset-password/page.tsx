import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

function ResetPasswordFormFallback() {
  return <div className="min-h-[402px]" aria-label="Loading password reset form" />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFormFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
