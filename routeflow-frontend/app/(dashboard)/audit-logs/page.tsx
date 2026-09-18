"use client";

import { useState } from "react";
import { FileClock } from "lucide-react";
import { useAuditLogs } from "@/hooks/use-audit-logs";
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryParams } from "@/hooks/use-query-params";
import { DataTable, FilterBar, Modal, Pagination, PageHeader, SearchInput, Select } from "@/components/ui";
import type { Column } from "@/components/ui";
import type { AuditLog } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const ENTITY_OPTIONS = [
  { value: "Order", label: "Order" },
  { value: "Shipment", label: "Shipment" },
  { value: "Delivery", label: "Delivery" },
  { value: "Customer", label: "Customer" },
  { value: "Driver", label: "Driver" },
  { value: "Vehicle", label: "Vehicle" },
  { value: "Warehouse", label: "Warehouse" },
  { value: "Product", label: "Product" },
];

export default function AuditLogsPage() {
  const { get, set } = useQueryParams();
  const page = Number(get("page") || 1);
  const entityType = get("entity_type");
  const [actionSearch, setActionSearch] = useState(get("action"));
  const debouncedAction = useDebounce(actionSearch);
  const [detail, setDetail] = useState<AuditLog | null>(null);

  const { data, isLoading, error, refetch } = useAuditLogs({
    page,
    entity_type: entityType || undefined,
    action: debouncedAction || undefined,
  });

  function handleActionChange(value: string) {
    setActionSearch(value);
    set({ action: value || undefined });
  }

  const columns: Column<AuditLog>[] = [
    { key: "action", header: "Action", render: (log) => <span className="font-mono text-xs text-ink">{log.action}</span> },
    { key: "entity", header: "Entity", render: (log) => `${log.entity_type} #${log.entity_id}` },
    { key: "user", header: "User", render: (log) => log.user ?? "System" },
    { key: "ip", header: "IP address", render: (log) => log.ip_address ?? "—" },
    { key: "when", header: "When", render: (log) => formatDateTime(log.created_at) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Audit Logs" description="Every create, update, and delete across your organization." />

      <FilterBar>
        <Select options={ENTITY_OPTIONS} placeholder="All entities" value={entityType} onChange={(e) => set({ entity_type: e.target.value || undefined })} className="w-44" />
        <SearchInput value={actionSearch} onChange={handleActionChange} placeholder="Exact action, e.g. delivery.updated" className="w-72" />
      </FilterBar>

      <DataTable
        columns={columns}
        data={data?.data}
        rowKey={(log) => log.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(log) => setDetail(log)}
        emptyState={{ icon: FileClock, title: "No activity recorded yet" }}
        footer={data?.meta && <Pagination meta={data.meta} onPageChange={(p) => set({ page: p })} />}
      />

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Audit log detail" size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-neutral">Action</p>
                <p className="font-mono text-ink">{detail.action}</p>
              </div>
              <div>
                <p className="text-xs text-neutral">Entity</p>
                <p className="text-ink">{detail.entity_type} #{detail.entity_id}</p>
              </div>
              <div>
                <p className="text-xs text-neutral">User</p>
                <p className="text-ink">{detail.user ?? "System"}</p>
              </div>
              <div>
                <p className="text-xs text-neutral">When</p>
                <p className="text-ink">{formatDateTime(detail.created_at)}</p>
              </div>
            </div>
            {detail.old_values && (
              <div>
                <p className="text-xs font-medium text-neutral mb-1">Before</p>
                <pre className="rounded-control bg-canvas p-3 text-xs overflow-x-auto">{JSON.stringify(detail.old_values, null, 2)}</pre>
              </div>
            )}
            {detail.new_values && (
              <div>
                <p className="text-xs font-medium text-neutral mb-1">After</p>
                <pre className="rounded-control bg-canvas p-3 text-xs overflow-x-auto">{JSON.stringify(detail.new_values, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
