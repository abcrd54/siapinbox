"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Input } from "@/components/ui";

export function QuickCreateAddress() {
  const router = useRouter();
  const [prefix, setPrefix] = useState("inbox");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFeedback(null);

    const response = await fetch("/api/email-addresses/random", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prefix })
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
    <form className="flex flex-col gap-2 md:flex-row md:items-center" onSubmit={onSubmit}>
      <Input
        value={prefix}
        onChange={(event) => setPrefix(event.target.value)}
        placeholder="prefix"
        className="min-w-44"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Membuat..." : "New Address"}
      </Button>
      <Link
        href="/dashboard/api-keys"
        className="inline-flex h-10 items-center justify-center rounded-md border border-line px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
      >
        API Keys
      </Link>
      {feedback ? <div className="text-xs text-muted">{feedback}</div> : null}
    </form>
  );
}
