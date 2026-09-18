"use client";

import { useAuth } from "@/providers/auth-provider";
import { Breadcrumbs, Card, CardBody, CardHeader, PageHeader, StatusBadge } from "@/components/ui";

export default function OrganizationSettingsPage() {
  const { user } = useAuth();
  const organization = user?.organization;

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Organization" }]} />
      <PageHeader title="Organization" description="Your organization's details." />

      <Card className="max-w-2xl">
        <CardHeader title={organization?.name ?? "—"} description="Organization details are managed by RouteFlow support." />
        <CardBody className="space-y-3">
          <div>
            <p className="text-xs text-neutral">Name</p>
            <p className="text-sm text-ink">{organization?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral">URL slug</p>
            <p className="text-sm text-ink font-mono">{organization?.slug ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral">Status</p>
            {organization?.status && <StatusBadge status={organization.status} />}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
