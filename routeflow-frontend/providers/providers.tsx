"use client";

import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "!rounded-card !border !border-border !shadow-elevated",
            },
          }}
        />
      </AuthProvider>
    </QueryProvider>
  );
}
