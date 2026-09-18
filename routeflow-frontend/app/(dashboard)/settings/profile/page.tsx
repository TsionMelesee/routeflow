"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Mail, Phone, ShieldCheck } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { can } from "@/lib/auth/permissions";
import { useUpdateUser } from "@/hooks/use-users";
import { authApi } from "@/lib/api/auth";
import { Breadcrumbs, Button, Card, CardBody, CardHeader, FieldGroup, Input, PageHeader, StatusBadge } from "@/components/ui";
import { titleCase } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const canEditSelf = can(user, "organization-admin");
  const updateUser = useUpdateUser(user?.id ?? -1);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [sendingReset, setSendingReset] = useState(false);

  if (!user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateUser.mutateAsync({ name, phone: phone || null, role_slugs: user!.roles ?? [] });
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update your profile.");
    }
  }

  async function handleSendPasswordReset() {
    setSendingReset(true);
    try {
      await authApi.forgotPassword(user!.email);
      toast.success("Password reset email sent — check your inbox.");
    } catch {
      toast.error("Couldn't send the reset email.");
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Profile" }]} />
      <PageHeader title="Profile" description="Your account details." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Details" description={canEditSelf ? undefined : "Contact an organization admin to change these."} />
          <CardBody>
            {canEditSelf ? (
              <form onSubmit={handleSave} className="space-y-4">
                <FieldGroup>
                  <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </FieldGroup>
                <Input label="Email" value={user.email} disabled hint="Email can't be changed here." />
                <div className="flex justify-end">
                  <Button type="submit" loading={updateUser.isPending}>
                    Save changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
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
              </div>
            )}
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Role" />
            <CardBody className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-neutral" />
                <div className="flex flex-wrap gap-1.5">
                  {(user.roles ?? []).map((role) => (
                    <span key={role} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {titleCase(role)}
                    </span>
                  ))}
                </div>
              </div>
              <StatusBadge status={user.status} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Password" />
            <CardBody>
              <p className="text-sm text-neutral mb-3">We&apos;ll email you a link to reset it.</p>
              <Button variant="outline" size="sm" icon={<KeyRound className="h-3.5 w-3.5" />} onClick={handleSendPasswordReset} loading={sendingReset}>
                Send reset email
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
