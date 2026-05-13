"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Input } from "@/components/ui";

export function EmailActions({
  emailId,
  currentLabel,
  compact = false
}: {
  emailId: string;
  currentLabel: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [label, setLabel] = useState(currentLabel);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    await fetch(`/api/emails/${emailId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ label })
    });

    setPending(false);
    router.refresh();
  }

  return (
    <div className={`flex gap-3 ${compact ? "flex-col xl:flex-row xl:items-center" : "flex-col md:flex-row md:items-center"}`}>
      <Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Label email" className={compact ? "xl:min-w-48" : ""} />
      <Button type="button" onClick={save} disabled={pending} className={compact ? "xl:self-auto" : ""}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
