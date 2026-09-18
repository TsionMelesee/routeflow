import { apiClient } from "./client";
import type { ApiResponse, AuditLog, PaginatedResponse } from "@/lib/types";

export interface AuditLogListParams {
  page?: number;
  per_page?: number;
  entity_type?: string;
  action?: string;
  user_id?: number;
}

export const auditLogsApi = {
  list: (params: AuditLogListParams) => apiClient.get<PaginatedResponse<AuditLog>>("/audit-logs", { params }),

  get: (id: number) => apiClient.get<ApiResponse<AuditLog>>(`/audit-logs/${id}`),
};
