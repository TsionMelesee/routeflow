"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { LoadingState } from "@/components/ui";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Backup to middleware.ts: middleware only checks for the cookie's
    // presence, not validity. If /auth/me comes back unauthenticated
    // (expired/revoked token), the api client's 401 handler already
    // clears the cookie and redirects — this covers the brief window
    // before that happens.
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <LoadingState label="Loading RouteFlow…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={cn("transition-all duration-200", collapsed ? "lg:pl-[72px]" : "lg:pl-[264px]")}>
        <Topbar onMobileMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
