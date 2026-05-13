"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Input } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface PublicInboxLinkItem {
  id: string;
  token: string;
  label: string | null;
  latest_only: boolean;
  status: string;
  expires_at: string | null;
  created_at: string;
  url: string;
}

export function PublicInboxLinkManager({
  emailAddressId,
  items
}: {
  emailAddressId: string;
  items: PublicInboxLinkItem[];
}) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [latestOnly, setLatestOnly] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createLink() {
    setPending(true);
    setError(null);

    const response = await fetch("/api/public-inbox-links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email_address_id: emailAddressId,
        label,
        latest_only: latestOnly
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Gagal membuat link");
      setPending(false);
      return;
    }

    setLabel("");
    setLatestOnly(false);
    setPending(false);
    router.refresh();
  }

  async function revokeLink(id: string) {
    await fetch(`/api/public-inbox-links/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "revoked" })
    });

    router.refresh();
  }

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url);
  }

  return (
    <div className="space-y-4 rounded-lg border border-line bg-white p-4">
      <div>
        <h3 className="text-sm font-semibold uppercase text-muted">Public Inbox Link</h3>
        <p className="mt-1 text-sm text-muted">Buat link read-only untuk pembeli tanpa akses dashboard.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Label link, mis. Buyer A" />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={latestOnly} onChange={(event) => setLatestOnly(event.target.checked)} />
          Hanya email terbaru
        </label>
        <Button type="button" onClick={createLink} disabled={pending}>
          {pending ? "Membuat..." : "Generate Link"}
        </Button>
      </div>

      {error ? <div className="text-sm text-rose-600">{error}</div> : null}

      <div className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="rounded-md border border-line bg-slate-50 p-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="text-sm font-medium">{item.label || "Public inbox link"}</div>
                  <div className="break-all text-xs text-slate-600">{item.url}</div>
                  <div className="text-xs text-muted">
                    {item.latest_only ? "Latest only" : "Full inbox"} • {item.status} • {formatDate(item.created_at)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" className="bg-white text-ink ring-1 ring-line hover:bg-slate-50" onClick={() => copyLink(item.url)}>
                    Copy
                  </Button>
                  {item.status === "active" ? (
                    <Button type="button" className="bg-rose-600 hover:bg-rose-700" onClick={() => revokeLink(item.id)}>
                      Revoke
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted">Belum ada public inbox link.</div>
        )}
      </div>
    </div>
  );
}
