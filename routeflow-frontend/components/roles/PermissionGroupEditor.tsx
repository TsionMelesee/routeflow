"use client";

import { titleCase } from "@/lib/utils";
import type { PermissionGroups } from "@/lib/api/roles";

export function PermissionGroupEditor({
  groups,
  selected,
  onChange,
  readOnly,
}: {
  groups: PermissionGroups;
  selected: Set<string>;
  onChange: (slug: string, checked: boolean) => void;
  readOnly?: boolean;
}) {
  const groupNames = Object.keys(groups).sort();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {groupNames.map((groupName) => (
        <div key={groupName} className="rounded-control border border-border p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral">{titleCase(groupName)}</p>
          <div className="space-y-1.5">
            {groups[groupName].map((permission) => (
              <label
                key={permission.slug}
                className={`flex items-start gap-2 text-sm ${readOnly ? "cursor-default" : "cursor-pointer"}`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(permission.slug)}
                  disabled={readOnly}
                  onChange={(e) => onChange(permission.slug, e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-brand focus:ring-brand-200 disabled:opacity-60"
                />
                <span className={readOnly ? "text-neutral" : "text-ink"}>
                  {permission.description || permission.slug}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
