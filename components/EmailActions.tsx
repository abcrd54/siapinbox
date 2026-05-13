"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Input } from "@/components/ui";

const statuses = ["unread", "read", "archived", "spam", "follow_up", "done"];

export function EmailActions({
  emailId,
  currentStatus,
  currentLabel,
  compact = false
}: {
  emailId: string;
  currentStatus: string;
  currentLabel: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [label, setLabel] = useState(currentLabel);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    await fetch(`/api/emails/${emailId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status, label })
    });

    setPending(false);
    router.refresh();
  }

  return (
    <div className={`flex gap-3 ${compact ? "flex-col xl:flex-row xl:items-center" : "flex-col md:flex-row md:items-center"}`}>
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-accent focus:shadow-focus"
      >
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Label email" className={compact ? "xl:min-w-48" : ""} />
      <Button type="button" onClick={save} disabled={pending} className={compact ? "xl:self-auto" : ""}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
