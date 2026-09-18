import { apiClient } from "./client";
import type { AppNotification, PaginatedResponse } from "@/lib/types";

export interface NotificationListMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  unread_count: number;
}

export interface NotificationListResponse {
  data: AppNotification[];
  meta: NotificationListMeta;
}

export const notificationsApi = {
  list: (params?: { page?: number; per_page?: number; unread_only?: boolean }) =>
    apiClient.get<NotificationListResponse>("/notifications", { params }),

  markRead: (id: string) => apiClient.post<{ message: string }>(`/notifications/${id}/read`),

  markAllRead: () => apiClient.post<{ message: string }>("/notifications/read-all"),
};

export type { PaginatedResponse };
