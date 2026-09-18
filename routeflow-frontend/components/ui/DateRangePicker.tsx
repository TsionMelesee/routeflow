"use client";

import { Input } from "./Input";

export interface DateRange {
  from: string;
  to: string;
}

export function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={value.from}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
        className="w-40"
        aria-label="From date"
      />
      <span className="text-sm text-neutral">to</span>
      <Input
        type="date"
        value={value.to}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
        className="w-40"
        aria-label="To date"
      />
    </div>
  );
}
