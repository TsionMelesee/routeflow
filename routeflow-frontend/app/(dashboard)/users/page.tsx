"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Users as UsersIcon } from "lucide-react";
import { useCreateUser, useUsers } from "@/hooks/use-users";
import { useDebounce } from "@/hooks/use-debounce";
import { useQueryParams } from "@/hooks/use-query-params";
import { Button, DataTable, FilterBar, Modal, Pagination, PageHeader, SearchInput, Select, StatusBadge } from "@/components/ui";
import type { Column } from "@/components/ui";
import { UserCreateForm, type UserCreateValues } from "@/components/users/UserForm";
import type { User } from "@/lib/types";
import { titleCase } from "@/lib/utils";

export default function UsersPage() {
  const router = useRouter();
  const { get, set } = useQueryParams();
  const [search, setSearch] = useState(get("search"));
  const debouncedSearch = useDebounce(search);
  const page = Number(get("page") || 1);
  const status = get("status");
  const createUser = useCreateUser();
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, error, refetch } = useUsers({
    page,
    search: debouncedSearch || undefined,
    status: (status as User["status"]) || undefined,
  });

  function handleSearchChange(value: string) {
    setSearch(value);
    set({ search: value || undefined });
  }

  async function handleCreate(values: UserCreateValues) {
    const result = await createUser.mutateAsync({ ...values, phone: values.phone || null });
    toast.success("User created.");
    setCreateOpen(false);
    router.push(`/users/${result.data.id}`);
  }

  const columns: Column<User>[] = [
    {
      key: "user",
      header: "User",
      render: (u) => (
        <div>
          <p className="font-medium text-ink">{u.name}</p>
          <p className="text-xs text-neutral">{u.email}</p>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      render: (u) => <span className="text-sm">{(u.roles ?? []).map(titleCase).join(", ") || "—"}</span>,
    },
    { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        description="People with access to your RouteFlow organization."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Add user
          </Button>
        }
      />

      <FilterBar>
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search by name or email…" className="w-72" />
        <Select
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "suspended", label: "Suspended" },
          ]}
          placeholder="All statuses"
          value={status}
          onChange={(e) => set({ status: e.target.value || undefined })}
          className="w-40"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={data?.data}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onRowClick={(u) => router.push(`/users/${u.id}`)}
        emptyState={{ icon: UsersIcon, title: "No users yet", action: { label: "Add user", onClick: () => setCreateOpen(true) } }}
        footer={data?.meta && <Pagination meta={data.meta} onPageChange={(p) => set({ page: p })} />}
      />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add user" description="Invite a new user to your organization." size="lg">
        <UserCreateForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>
    </div>
  );
}
