"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
}

export function Tabs({ items, value, onChange }: { items: TabItem[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-control bg-canvas p-1 w-fit">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "rounded-control px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === item.value ? "bg-surface text-ink shadow-sm" : "text-neutral hover:text-ink",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
