import { sanitizeEmailHtml } from "@/lib/sanitize-email-html";
import { formatDate } from "@/lib/utils";

import { StatusBadge } from "./StatusBadge";
import { Card } from "./ui";

export function EmailDetail({
  email
}: {
  email: {
    subject: string | null;
    from_email: string;
    from_name: string | null;
    to_email: string;
    received_at: string;
    status: string;
    label: string;
    text_body: string | null;
    html_body: string | null;
    raw_headers: unknown;
    attachments: unknown;
  };
}) {
  const htmlPreview = sanitizeEmailHtml(email.html_body);

  return (
    <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="overflow-hidden rounded-xl p-0">
        <div className="border-b border-line bg-gradient-to-r from-slate-50 to-white px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">{email.subject || "(Tanpa subject)"}</h2>
            <StatusBadge value={email.status} />
          </div>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <div>Dari: {email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}</div>
            <div>Ke: {email.to_email}</div>
            <div>Label: {email.label}</div>
            <div>Diterima: {formatDate(email.received_at)}</div>
          </div>
        </div>

        <div className="grid gap-4 p-4 xl:grid-cols-2">
          <section className="rounded-xl border border-line bg-slate-50 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase text-muted">Text Body</h3>
            <pre className="max-h-[280px] overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {email.text_body || "(Kosong)"}
            </pre>
          </section>

          <section className="rounded-xl border border-line bg-slate-50 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase text-muted">Summary</h3>
            <div className="grid gap-3 text-sm text-slate-700">
              <div className="rounded-lg border border-line bg-white px-3 py-2">
                <div className="text-xs uppercase text-muted">From</div>
                <div className="mt-1 break-all">{email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}</div>
              </div>
              <div className="rounded-lg border border-line bg-white px-3 py-2">
                <div className="text-xs uppercase text-muted">To</div>
                <div className="mt-1 break-all">{email.to_email}</div>
              </div>
              <div className="rounded-lg border border-line bg-white px-3 py-2">
                <div className="text-xs uppercase text-muted">Status</div>
                <div className="mt-1">{email.status}</div>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-line">
          <div className="border-b border-line px-4 py-3">
            <h3 className="text-xs font-semibold uppercase text-muted">HTML Preview</h3>
          </div>
          <div className="min-h-[480px] overflow-y-auto bg-slate-50 p-4">
            {htmlPreview ? (
              <div className="rounded-xl border border-line bg-white p-5 text-sm text-slate-700 shadow-sm" dangerouslySetInnerHTML={{ __html: htmlPreview }} />
            ) : (
              <div className="rounded-xl border border-dashed border-line bg-white p-6 text-slate-500">(Tidak ada HTML body)</div>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-5">
        <Card className="space-y-3 rounded-xl">
          <h3 className="text-xs font-semibold uppercase text-muted">Raw Headers</h3>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-line bg-slate-50 p-4 text-xs text-slate-700">
            {JSON.stringify(email.raw_headers, null, 2)}
          </pre>
        </Card>

        <Card className="space-y-3 rounded-xl">
          <h3 className="text-xs font-semibold uppercase text-muted">Attachments</h3>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-line bg-slate-50 p-4 text-xs text-slate-700">
            {JSON.stringify(email.attachments, null, 2)}
          </pre>
        </Card>
      </div>
    </div>
  );
}
