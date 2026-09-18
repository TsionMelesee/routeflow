"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Pencil, Trash2 } from "lucide-react";
import { useDeleteRole, usePermissionGroups, useRole, useUpdateRole, useUpdateRolePermissions } from "@/hooks/use-roles";
import { Breadcrumbs, Button, Card, CardBody, CardHeader, ConfirmDialog, ErrorState, FieldGroup, Input, LoadingState, Modal, Textarea } from "@/components/ui";
import { PermissionGroupEditor } from "@/components/roles/PermissionGroupEditor";

export default function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const roleId = Number(id);
  const router = useRouter();
  const { data: role, isLoading, error, refetch } = useRole(roleId);
  const { data: permissionGroups, isLoading: groupsLoading } = usePermissionGroups();
  const updateRole = useUpdateRole(roleId);
  const updatePermissions = useUpdateRolePermissions(roleId);
  const deleteRole = useDeleteRole();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    if (role) {
      setSelected(new Set(role.permissions ?? []));
      setEditName(role.name);
      setEditDescription(role.description ?? "");
    }
  }, [role]);

  if (isLoading) return <LoadingState label="Loading role…" />;
  if (error || !role) return <ErrorState error={error} onRetry={() => refetch()} />;

  const readOnly = role.is_system;
  const hasChanges = role.permissions && (selected.size !== role.permissions.length || role.permissions.some((p) => !selected.has(p)));

  function toggle(slug: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(slug);
      else next.delete(slug);
      return next;
    });
  }

  async function handleSavePermissions() {
    try {
      await updatePermissions.mutateAsync(Array.from(selected));
      toast.success("Permissions updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update permissions.");
    }
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateRole.mutateAsync({ name: editName, description: editDescription || null });
      toast.success("Role updated.");
      setEditOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update this role.");
    }
  }

  async function handleDelete() {
    try {
      await deleteRole.mutateAsync(roleId);
      toast.success("Role deleted.");
      router.push("/roles");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete this role.");
      setConfirmDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Roles & Permissions", href: "/roles" }, { label: role.name }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-ink">{role.name}</h1>
            {role.is_system && (
              <span className="flex items-center gap-1 rounded-full bg-neutral-bg px-2 py-0.5 text-xs font-medium text-neutral">
                <Lock className="h-3 w-3" />
                System role
              </span>
            )}
          </div>
          {role.description && <p className="text-sm text-neutral mt-0.5">{role.description}</p>}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="outline" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {readOnly && (
        <div className="rounded-card border border-border bg-canvas px-4 py-3 text-sm text-neutral">
          This is a system role shared across organizations and can&apos;t be edited or deleted — permissions are shown for reference.
        </div>
      )}

      <Card>
        <CardHeader
          title="Permissions"
          description={readOnly ? undefined : "Choose what this role can access."}
          action={
            !readOnly && hasChanges ? (
              <Button size="sm" onClick={handleSavePermissions} loading={updatePermissions.isPending}>
                Save changes
              </Button>
            ) : undefined
          }
        />
        <CardBody>
          {groupsLoading || !permissionGroups ? (
            <div className="h-40 animate-pulse rounded bg-canvas" />
          ) : (
            <PermissionGroupEditor groups={permissionGroups} selected={selected} onChange={toggle} readOnly={readOnly} />
          )}
        </CardBody>
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit role">
        <form onSubmit={handleEditSave} className="space-y-4">
          <FieldGroup cols={1}>
            <Input label="Name" required value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Textarea label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
          </FieldGroup>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={updateRole.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this role?"
        description={`This will permanently remove ${role.name}. Roles still assigned to users can't be deleted.`}
        confirmLabel="Delete role"
        variant="danger"
        loading={deleteRole.isPending}
      />
    </div>
  );
}
