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
        className="h-11 min-w-40 border-white/10 bg-white/8 text-white placeholder:text-white/35 focus:border-white/25"
      />
      <Button type="submit" disabled={pending} className="h-11 rounded-2xl bg-white px-4 text-ink hover:bg-white/90">
        {pending ? "Membuat..." : "New Address"}
      </Button>
      <Link
        href="/dashboard/api-keys"
        className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 px-4 text-sm text-white/75 transition hover:bg-white/8"
      >
        API Keys
      </Link>
      {feedback ? <div className="text-xs text-white/70">{feedback}</div> : null}
    </form>
  );
}
