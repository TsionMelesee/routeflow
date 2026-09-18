import { Suspense } from "react";
import LoginForm from "./login-form";

function LoginFormFallback() {
  return <div className="min-h-[302px]" aria-label="Loading sign in form" />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
