"use client";

import Link from "next/link";
import { Building2, ChevronRight, UserCircle } from "lucide-react";
import { PageHeader, Card } from "@/components/ui";

const SECTIONS = [
  { href: "/settings/profile", icon: UserCircle, title: "Profile", description: "Your name, contact details, and password." },
  { href: "/settings/organization", icon: Building2, title: "Organization", description: "Your organization's details." },
];

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Settings" description="Manage your account and organization." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="flex items-center gap-4 p-5 hover:border-brand-300 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600 shrink-0">
                <section.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-ink">{section.title}</p>
                <p className="text-sm text-neutral">{section.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
