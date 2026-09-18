"use client";

import { Menu } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { NotificationsBell } from "./NotificationsBell";
import type { Crumb } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui";

export interface TopbarProps {
  onMobileMenuClick: () => void;
  breadcrumbs?: Crumb[];
}

export function Topbar({ onMobileMenuClick, breadcrumbs }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface/95 backdrop-blur px-4 sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden rounded-control p-2 hover:bg-canvas shrink-0"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-ink" />
        </button>
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
      </div>
      <div className="flex items-center gap-1.5">
        <NotificationsBell />
        <UserMenu />
      </div>
    </header>
  );
}
