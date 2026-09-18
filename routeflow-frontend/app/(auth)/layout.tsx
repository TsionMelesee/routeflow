import { Truck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-control bg-accent text-white">
            <Truck className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl font-semibold text-white tracking-tight">RouteFlow</span>
        </div>
        <div className="rounded-card bg-surface p-8 shadow-elevated">{children}</div>
      </div>
    </div>
  );
}
