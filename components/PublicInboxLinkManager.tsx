"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CopyButton } from "@/components/CopyButton";
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
  const [success, setSuccess] = useState<string | null>(null);

  async function createLink() {
    setPending(true);
    setError(null);
    setSuccess(null);

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
      setError(result.error || "Gagal membuat share link");
      setPending(false);
      return;
    }

    const createdUrl = result?.public_inbox_link?.url as string | undefined;

    if (createdUrl) {
      await navigator.clipboard.writeText(createdUrl);
      setSuccess("Share link dibuat dan langsung disalin.");
    } else {
      setSuccess("Share link berhasil dibuat.");
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

  return (
    <div className="space-y-5 rounded-xl border border-line bg-white p-0 shadow-panel">
      <div className="border-b border-line bg-gradient-to-r from-slate-50 to-white px-5 py-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink">Share to Customer</h3>
            <p className="mt-1 text-sm text-muted">
              Buat link read-only untuk customer. Akses dashboard internal kamu tetap normal, sedangkan customer hanya bisa buka link yang kamu kirim.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-slate-600">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Share Mode</div>
            <div className="mt-2">{latestOnly ? "Latest only" : "Full inbox"}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 pb-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Generate Share Link</div>
          <p className="mt-1 text-sm text-muted">Kirim link ini ke customer agar mereka bisa cek inbox tanpa login.</p>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_auto]">
          <Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Label link, mis. Customer A" />
          <label className="flex items-center gap-2 rounded-lg border border-line bg-slate-50 px-3 text-sm text-slate-700">
            <input type="checkbox" checked={latestOnly} onChange={(event) => setLatestOnly(event.target.checked)} />
            Latest only
          </label>
          <Button type="button" onClick={createLink} disabled={pending}>
            {pending ? "Membuat..." : "Generate Share Link"}
          </Button>
        </div>

        {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

        <div className="space-y-3">
          {items.length ? (
            items.map((item) => (
              <div key={item.id} className="rounded-xl border border-line bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium">{item.label || "Customer share link"}</div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.latest_only ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                        {item.latest_only ? "Latest only" : "Full inbox"}
                      </span>
                    </div>
                    <div className="break-all text-xs text-slate-600">{item.url}</div>
                    <div className="text-xs text-muted">
                      {item.status} {" • "} {formatDate(item.created_at)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <CopyButton value={item.url} label="Copy link" className="bg-white text-ink ring-1 ring-line hover:bg-slate-50" />
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
            <div className="rounded-xl border border-dashed border-line bg-slate-50 px-4 py-5 text-sm text-muted">
              Belum ada share link. Generate satu link kalau customer perlu lihat inbox tanpa login.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
