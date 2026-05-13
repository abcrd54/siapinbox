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
    <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
      <Card className="space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">{email.subject || "(Tanpa subject)"}</h2>
            <StatusBadge value={email.status} />
          </div>
          <div className="grid gap-2 text-sm text-slate-600">
            <div>Dari: {email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}</div>
            <div>Ke: {email.to_email}</div>
            <div>Label: {email.label}</div>
            <div>Diterima: {formatDate(email.received_at)}</div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase text-muted">Text Body</h3>
          <pre className="whitespace-pre-wrap rounded-lg border border-line bg-slate-50 p-4 text-sm text-slate-700">
            {email.text_body || "(Kosong)"}
          </pre>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase text-muted">HTML Preview</h3>
          <div className="rounded-lg border border-line bg-white p-4 text-sm text-slate-700">
            {htmlPreview ? (
              <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
            ) : (
              <div className="text-slate-500">(Tidak ada HTML body)</div>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="space-y-3">
          <h3 className="text-xs font-semibold uppercase text-muted">Raw Headers</h3>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-line bg-slate-50 p-4 text-xs text-slate-700">
            {JSON.stringify(email.raw_headers, null, 2)}
          </pre>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-xs font-semibold uppercase text-muted">Attachments</h3>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-line bg-slate-50 p-4 text-xs text-slate-700">
            {JSON.stringify(email.attachments, null, 2)}
          </pre>
        </Card>
      </div>
    </div>
  );
}
