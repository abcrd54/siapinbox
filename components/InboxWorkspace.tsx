import Link from "next/link";

import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui";
import { EmailActions } from "@/components/EmailActions";
import { sanitizeEmailHtml } from "@/lib/sanitize-email-html";
import { formatDate, truncate } from "@/lib/utils";

interface AddressItem {
  id: string;
  email: string;
  label: string | null;
  project: string | null;
  status: string;
  total_messages: number;
  unread_messages: number;
}

interface MessageItem {
  id: string;
  from_email: string;
  from_name: string | null;
  subject: string | null;
  text_body: string | null;
  html_body: string | null;
  status: string;
  received_at: string;
}

interface DetailItem extends MessageItem {
  to_email: string;
  label: string;
  raw_headers: unknown;
  attachments: unknown;
}

export function InboxWorkspace({
  addresses,
  selectedAddressId,
  messages,
  selectedMessageId,
  selectedEmail
}: {
  addresses: AddressItem[];
  selectedAddressId: string | null;
  messages: MessageItem[];
  selectedMessageId: string | null;
  selectedEmail: DetailItem | null;
}) {
  return (
    <div className="grid min-h-[78vh] gap-4 xl:grid-cols-[280px_340px_minmax(0,1fr)] 2xl:grid-cols-[300px_380px_minmax(0,1fr)]">
      <Card className="min-h-0 overflow-hidden rounded-xl p-0">
        <div className="border-b border-line px-4 py-3">
          <div className="text-xs font-semibold uppercase text-muted">Addresses</div>
        </div>
        <div className="max-h-[78vh] overflow-y-auto">
          {addresses.length ? (
            addresses.map((address) => {
              const isActive = address.id === selectedAddressId;

              return (
                <Link
                  key={address.id}
                  href={`/dashboard?address=${address.id}`}
                  className={`block border-b border-line px-4 py-3 transition ${isActive ? "bg-teal-50/80 text-ink" : "hover:bg-slate-50"}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{address.email}</div>
                        <div className="mt-1 truncate text-xs text-muted">
                          {address.label || address.project || "No label"}
                        </div>
                      </div>
                      <div className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${address.unread_messages ? "bg-warn text-white" : "bg-slate-100 text-muted"}`}>
                        {address.unread_messages}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <StatusBadge value={address.status} />
                      <div className="text-xs text-muted">
                        {address.total_messages} email
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-5 text-sm text-muted">Belum ada address yang dibuat.</div>
          )}
        </div>
      </Card>

      <Card className="min-h-0 overflow-hidden rounded-xl p-0">
        <div className="border-b border-line px-4 py-3">
          <div className="text-xs font-semibold uppercase text-muted">Messages</div>
        </div>
        <div className="max-h-[78vh] overflow-y-auto">
          {messages.length ? (
            messages.map((message) => {
              const isActive = message.id === selectedMessageId;

              return (
                <Link
                  key={message.id}
                  href={`/dashboard?address=${selectedAddressId}&email=${message.id}`}
                  className={`block border-b border-line px-4 py-3 transition ${isActive ? "bg-blue-50/80" : "hover:bg-slate-50"}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-semibold">{message.subject || "(Tanpa subject)"}</div>
                      <div className="shrink-0 text-xs text-slate-500">{formatDate(message.received_at)}</div>
                    </div>
                    <div className="truncate text-xs text-slate-600">
                      {message.from_name ? `${message.from_name} <${message.from_email}>` : message.from_email}
                    </div>
                    <p className="line-clamp-2 text-sm text-muted">{truncate(message.text_body || message.html_body || "", 120)}</p>
                    <div className="flex items-center justify-between">
                      <StatusBadge value={message.status} />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-5 text-sm text-muted">Belum ada email untuk address ini.</div>
          )}
        </div>
      </Card>

      <Card className="min-h-0 overflow-hidden rounded-xl p-0">
        {selectedEmail ? (
          <div className="flex h-full flex-col">
            <div className="border-b border-line bg-gradient-to-r from-slate-50 to-white px-5 py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">{selectedEmail.subject || "(Tanpa subject)"}</h2>
                    <StatusBadge value={selectedEmail.status} />
                  </div>
                  <div className="mt-3 grid gap-1 text-sm text-slate-600">
                    <div>
                      Dari: {selectedEmail.from_name ? `${selectedEmail.from_name} <${selectedEmail.from_email}>` : selectedEmail.from_email}
                    </div>
                    <div>Ke: {selectedEmail.to_email}</div>
                    <div>Diterima: {formatDate(selectedEmail.received_at)}</div>
                  </div>
                </div>
                <div className="xl:min-w-[320px]">
                  <div className="mb-2 text-xs font-semibold uppercase text-muted">Quick Actions</div>
                  <div className="rounded-lg border border-line bg-white p-3">
                    <EmailActions
                      emailId={selectedEmail.id}
                      currentLabel={selectedEmail.label}
                      compact
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="grid min-h-0 gap-4">
                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-xl border border-line bg-slate-50 p-4">
                    <div className="mb-3 text-xs font-semibold uppercase text-muted">Text</div>
                    <pre className="max-h-[260px] overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {selectedEmail.text_body || "(Kosong)"}
                    </pre>
                  </div>

                  <div className="rounded-xl border border-line bg-slate-50 p-4">
                    <div className="mb-3 text-xs font-semibold uppercase text-muted">Message Info</div>
                    <div className="grid gap-3 text-sm text-slate-700">
                      <div className="rounded-lg border border-line bg-white px-3 py-2">
                        <div className="text-xs uppercase text-muted">From</div>
                        <div className="mt-1 break-all">{selectedEmail.from_name ? `${selectedEmail.from_name} <${selectedEmail.from_email}>` : selectedEmail.from_email}</div>
                      </div>
                      <div className="rounded-lg border border-line bg-white px-3 py-2">
                        <div className="text-xs uppercase text-muted">To</div>
                        <div className="mt-1 break-all">{selectedEmail.to_email}</div>
                      </div>
                      <div className="rounded-lg border border-line bg-white px-3 py-2">
                        <div className="text-xs uppercase text-muted">Label</div>
                        <div className="mt-1">{selectedEmail.label || "-"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 overflow-hidden rounded-xl border border-line bg-white">
                  <div className="border-b border-line px-4 py-3">
                    <div className="text-xs font-semibold uppercase text-muted">HTML Preview</div>
                  </div>
                  <div className="min-h-[420px] overflow-y-auto bg-slate-50 p-4">
                    {selectedEmail.html_body ? (
                      <div className="rounded-lg border border-line bg-white p-5 text-sm text-slate-700 shadow-sm" dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(selectedEmail.html_body) }} />
                    ) : (
                      <div className="rounded-lg border border-dashed border-line bg-white p-6 text-sm text-slate-500">(Tidak ada HTML body)</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="min-h-0 space-y-4 overflow-y-auto">
                <div className="rounded-xl border border-line bg-slate-50 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase text-muted">Raw Headers</div>
                  <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
                    {JSON.stringify(selectedEmail.raw_headers, null, 2)}
                  </pre>
                </div>
                <div className="rounded-xl border border-line bg-slate-50 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase text-muted">Attachments</div>
                  <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
                    {JSON.stringify(selectedEmail.attachments, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-10 text-center text-sm text-muted">
            Pilih email dari panel tengah untuk melihat isi pesan.
          </div>
        )}
      </Card>
    </div>
  );
}
