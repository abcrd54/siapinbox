import { CopyButton } from "@/components/CopyButton";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export function EmailAddressHeader({
  address,
  publicMessagesUrl,
  publicLatestUrl
}: {
  address: {
    email: string;
    label: string | null;
    project: string | null;
    purpose: string | null;
    status: string;
    created_at: string;
  };
  publicMessagesUrl: string;
  publicLatestUrl: string;
}) {
  return (
    <Card className="grid gap-5 rounded-xl xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold">{address.email}</h2>
          <StatusBadge value={address.status} />
          <CopyButton value={address.email} label="Copy email" className="h-8 bg-white text-ink ring-1 ring-line hover:bg-slate-50" />
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          <div>Label: {address.label || "-"}</div>
          <div>Project: {address.project || "-"}</div>
          <div>Purpose: {address.purpose || "-"}</div>
          <div>Dibuat: {formatDate(address.created_at)}</div>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-line bg-slate-50 p-4">
        <div>
          <div className="text-xs font-semibold uppercase text-muted">Public API</div>
          <div className="mt-2 text-sm text-slate-600">Gunakan endpoint ini untuk integrasi platform lain.</div>
        </div>
        <div className="space-y-2 break-all rounded-md border border-line bg-white p-3 text-xs text-slate-700">
          <div>GET {publicMessagesUrl}</div>
          <div>GET {publicLatestUrl}</div>
        </div>
      </div>
    </Card>
  );
}
