"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotificationsList } from "@/hooks/use-notifications";
import { useQueryParams } from "@/hooks/use-query-params";
import { Button, Card, EmptyState, ErrorState, LoadingState, PageHeader, Pagination } from "@/components/ui";
import { cn, formatDateTime } from "@/lib/utils";

const TYPE_ICON_TONE: Record<string, string> = {
  "delivery.assigned": "text-info",
  "delivery.failed": "text-danger",
  "delivery.delivered": "text-success",
};

export default function NotificationsPage() {
  const { get, set } = useQueryParams();
  const page = Number(get("page") || 1);
  const { data, isLoading, error, refetch } = useNotificationsList({ page, per_page: 20 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = data?.meta.unread_count ?? 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" icon={<CheckCheck className="h-4 w-4" />} onClick={() => markAllRead.mutate()} loading={markAllRead.isPending}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <Card>
        {isLoading ? (
          <LoadingState label="Loading notifications…" />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !data || data.data.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Bell} title="No notifications yet" description="Important events — assignments, failures, deliveries — will show up here." />
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {data.data.map((n) => (
                <div key={n.id} className={cn("flex items-start justify-between gap-4 px-5 py-3.5", !n.read_at && "bg-brand-50/40")}>
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas", TYPE_ICON_TONE[n.data.type])}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-ink">{n.data.message}</p>
                      <p className="mt-0.5 text-xs text-neutral">{formatDateTime(n.created_at)}</p>
                    </div>
                  </div>
                  {!n.read_at && (
                    <button
                      onClick={() => markRead.mutate(n.id)}
                      className="shrink-0 text-xs font-medium text-brand hover:underline whitespace-nowrap"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Pagination meta={data.meta} onPageChange={(p) => set({ page: p })} />
          </>
        )}
      </Card>
    </div>
  );
}
