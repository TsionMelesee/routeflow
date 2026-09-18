"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, ShieldCheck } from "lucide-react";
import { useCreateRole, useRoles } from "@/hooks/use-roles";
import { Button, DataTable, Modal, PageHeader } from "@/components/ui";
import type { Column } from "@/components/ui";
import { RoleForm } from "@/components/roles/RoleForm";
import type { Role } from "@/lib/types";
import type { RolePayload } from "@/lib/api/roles";

export default function RolesPage() {
  const router = useRouter();
  const { data: roles, isLoading, error, refetch } = useRoles();
  const createRole = useCreateRole();
  const [createOpen, setCreateOpen] = useState(false);

  async function handleCreate(payload: RolePayload) {
    const result = await createRole.mutateAsync(payload);
    toast.success("Role created.");
    setCreateOpen(false);
    router.push(`/roles/${result.data.id}`);
  }

  const columns: Column<Role>[] = [
    {
      key: "role",
      header: "Role",
      render: (r) => (
        <div>
          <p className="font-medium text-ink">{r.name}</p>
          {r.description && <p className="text-xs text-neutral">{r.description}</p>}
        </div>
      ),
    },
    {
      key: "scope",
      header: "Scope",
      render: (r) => (
        <span className={`text-xs font-medium ${r.is_global ? "text-brand" : "text-neutral"}`}>
          {r.is_global ? "Global template" : "Organization role"}
        </span>
      ),
    },
    { key: "permissions", header: "Permissions", render: (r) => `${r.permissions?.length ?? 0} granted` },
    {
      key: "type",
      header: "Type",
      render: (r) => (r.is_system ? <span className="text-xs text-neutral">System</span> : <span className="text-xs text-info font-medium">Custom</span>),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Roles & Permissions"
        description="Manage what each role can see and do."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Add role
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={roles}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(r) => router.push(`/roles/${r.id}`)}
        emptyState={{ icon: ShieldCheck, title: "No roles yet" }}
      />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add role" description="Create a custom role for your organization.">
        <RoleForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>
    </div>
  );
}
