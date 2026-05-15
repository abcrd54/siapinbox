"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";

export function QuickCreateAddress() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function createAddress() {
    setPending(true);
    setFeedback(null);

    const response = await fetch("/api/email-addresses/random", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok) {
      setFeedback(result.error || "Gagal membuat email");
      setPending(false);
      return;
    }

    const createdId = result?.email_address?.id as string | undefined;
    setFeedback(result?.email_address?.email || "Berhasil dibuat");
    setPending(false);

    if (createdId) {
      router.push(`/dashboard?address=${createdId}`);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <Button type="button" onClick={createAddress} disabled={pending}>
        {pending ? "Membuat..." : "New Address"}
      </Button>
      <Link
        href="/dashboard/api-keys"
        className="inline-flex h-10 items-center justify-center rounded-md border border-line px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
      >
        API Keys
      </Link>
      {feedback ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{feedback}</span>
          <CopyButton value={feedback} label="Copy email" className="h-8 bg-white text-ink ring-1 ring-line hover:bg-slate-50" />
        </div>
      ) : null}
    </div>
  );
}
