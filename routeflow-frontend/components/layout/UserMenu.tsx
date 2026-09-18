"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Dropdown, DropdownItem } from "@/components/ui";
import { initials } from "@/lib/utils";

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-2.5 rounded-control px-2 py-1.5 hover:bg-canvas">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {initials(user.name)}
          </span>
          <span className="hidden sm:block text-left">
            <span className="block text-sm font-medium text-ink leading-tight">{user.name}</span>
            <span className="block text-xs text-neutral leading-tight">{user.roles?.[0]?.replace(/-/g, " ") ?? "Member"}</span>
          </span>
        </button>
      }
    >
      <div className="border-b border-border px-3 py-2">
        <p className="text-sm font-medium text-ink truncate">{user.name}</p>
        <p className="text-xs text-neutral truncate">{user.email}</p>
      </div>
      <DropdownItem icon={<UserIcon className="h-4 w-4" />} onClick={() => router.push("/settings/profile")}>
        Profile
      </DropdownItem>
      <DropdownItem icon={<Settings className="h-4 w-4" />} onClick={() => router.push("/settings")}>
        Settings
      </DropdownItem>
      <div className="border-t border-border my-1" />
      <DropdownItem icon={<LogOut className="h-4 w-4" />} danger onClick={() => logout().then(() => router.push("/login"))}>
        Log out
      </DropdownItem>
    </Dropdown>
  );
}
