"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS } from "@/lib/nav";
import { useAuth } from "@/providers/auth-provider";
import { canSeeNavItem } from "@/lib/auth/permissions";

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  /** When set, renders as a mobile drawer instead of the fixed desktop rail. */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const content = (
    <div className="flex h-full flex-col bg-brand-900 text-white">
      <div className={cn("flex h-16 items-center gap-2.5 px-4 shrink-0", collapsed && "justify-center px-0")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-accent text-white">
          <Truck className="h-4.5 w-4.5" />
        </div>
        {!collapsed && <span className="font-display text-lg font-semibold tracking-tight">RouteFlow</span>}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2.5 py-3 space-y-5">
        {NAV_SECTIONS.map((section, i) => {
          const visibleItems = section.items.filter((item) => canSeeNavItem(user, item.visibility));
          if (visibleItems.length === 0) return null;

          return (
            <div key={i}>
              {section.label && !collapsed && (
                <p className="px-2.5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-300">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-control px-2.5 py-2 text-sm font-medium transition-colors",
                        collapsed && "justify-center",
                        active ? "bg-brand-700 text-white" : "text-brand-100 hover:bg-brand-800 hover:text-white",
                      )}
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex items-center gap-2 border-t border-brand-800 px-4 py-3 text-sm text-brand-200 hover:text-white shrink-0"
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        {!collapsed && "Collapse"}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          "hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-200",
          collapsed ? "w-[72px]" : "w-[264px]",
        )}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-ink/50" onClick={onMobileClose} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-[264px]">{content}</aside>
        </div>
      )}
    </>
  );
}
