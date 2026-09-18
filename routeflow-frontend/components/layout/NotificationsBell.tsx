"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";
import { Dropdown } from "@/components/ui";
import { cn, formatRelative } from "@/lib/utils";
import { toast } from "sonner";

export function NotificationsBell() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications", "bell"],
    queryFn: () => notificationsApi.list({ per_page: 6 }),
    refetchInterval: 60_000,
  });

  const unreadCount = data?.meta.unread_count ?? 0;
  const notifications = data?.data ?? [];

  async function handleMarkAllRead() {
    try {
      await notificationsApi.markAllRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      toast.error("Couldn't mark notifications as read.");
    }
  }

  return (
    <Dropdown
      className="w-80"
      trigger={
        <button className="relative rounded-control p-2 hover:bg-canvas" aria-label="Notifications">
          <Bell className="h-5 w-5 text-ink" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      }
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <p className="text-sm font-medium text-ink">Notifications</p>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-neutral">You&apos;re all caught up.</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={cn("border-b border-border px-3 py-2.5 last:border-0", !n.read_at && "bg-brand-50/50")}>
              <p className="text-sm text-ink">{n.data.message}</p>
              <p className="mt-0.5 text-xs text-neutral">{formatRelative(n.created_at)}</p>
            </div>
          ))
        )}
      </div>
      <Link
        href="/notifications"
        className="block border-t border-border px-3 py-2 text-center text-sm font-medium text-brand hover:bg-canvas"
      >
        View all notifications
      </Link>
    </Dropdown>
  );
}
