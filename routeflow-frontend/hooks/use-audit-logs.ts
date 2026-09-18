import { useQuery } from "@tanstack/react-query";
import { auditLogsApi, type AuditLogListParams } from "@/lib/api/audit-logs";

export function useAuditLogs(params: AuditLogListParams) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => auditLogsApi.list(params),
    placeholderData: (prev) => prev,
  });
}
