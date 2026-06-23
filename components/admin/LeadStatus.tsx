"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "@/lib/admin/ops-actions";

const STATUSES: [string, string][] = [
  ["new", "новая"],
  ["contacted", "связались"],
  ["booked", "записан"],
  ["done", "завершено"],
];

export function LeadStatus({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      className="input"
      style={{ padding: "6px 10px", width: "auto" }}
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(() => updateLeadStatus(id, e.target.value))}
    >
      {STATUSES.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  );
}
