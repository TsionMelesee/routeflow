"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { useDeleteUser, useUpdateUser, useUser } from "@/hooks/use-users";
import { useAuth } from "@/providers/auth-provider";
import { Breadcrumbs, Button, Card, CardBody, CardHeader, ConfirmDialog, ErrorState, LoadingState, Modal, StatusBadge } from "@/components/ui";
import { UserEditForm, type UserUpdateValues } from "@/components/users/UserForm";
import { titleCase } from "@/lib/utils";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = Number(id);
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { data: user, isLoading, error, refetch } = useUser(userId);
  const updateUser = useUpdateUser(userId);
  const deleteUser = useDeleteUser();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  if (isLoading) return <LoadingState label="Loading user…" />;
  if (error || !user) return <ErrorState error={error} onRetry={() => refetch()} />;

  const isSelf = currentUser?.id === user.id;

  async function handleUpdate(values: UserUpdateValues) {
    await updateUser.mutateAsync({ ...values, phone: values.phone || null });
    toast.success("User updated.");
    setEditOpen(false);
  }

  async function handleDelete() {
    try {
      await deleteUser.mutateAsync(userId);
      toast.success("User removed.");
      router.push("/users");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove this user.");
      setConfirmDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Users", href: "/users" }, { label: user.name }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-display font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-ink">{user.name}</h1>
              <StatusBadge status={user.status} />
            </div>
            <p className="text-sm text-neutral">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<Pencil className="h-4 w-4" />} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          {!isSelf && (
            <Button variant="outline" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDeleteOpen(true)}>
              Remove
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Contact information" />
          <CardBody className="space-y-3">
            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 mt-0.5 text-neutral shrink-0" />
              <div>
                <p className="text-xs text-neutral">Email</p>
                <p className="text-sm text-ink">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 mt-0.5 text-neutral shrink-0" />
              <div>
                <p className="text-xs text-neutral">Phone</p>
                <p className="text-sm text-ink">{user.phone || "—"}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Roles" />
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {(user.roles ?? []).map((role) => (
                <span key={role} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                  {titleCase(role)}
                </span>
              ))}
              {(user.roles ?? []).length === 0 && <p className="text-sm text-neutral">No roles assigned.</p>}
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit user" size="lg">
        <UserEditForm user={user} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove this user?"
        description={`This will permanently remove ${user.name}'s access.`}
        confirmLabel="Remove user"
        variant="danger"
        loading={deleteUser.isPending}
      />
    </div>
  );
}
