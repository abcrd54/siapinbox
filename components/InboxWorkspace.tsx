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
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[300px_360px_minmax(0,1fr)]">
      <Card className="min-h-0 overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Addresses</div>
        </div>
        <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
          {addresses.length ? (
            addresses.map((address) => {
              const isActive = address.id === selectedAddressId;

              return (
                <Link
                  key={address.id}
                  href={`/dashboard?address=${address.id}`}
                  className={`block border-b border-slate-100 px-5 py-4 transition ${isActive ? "bg-ink text-white" : "hover:bg-slate-50"}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{address.email}</div>
                        <div className={`mt-1 text-xs ${isActive ? "text-white/65" : "text-slate-500"}`}>
                          {address.label || address.project || "No label"}
                        </div>
                      </div>
                      <div className="shrink-0 text-xs">{address.unread_messages}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <StatusBadge value={address.status} />
                      <div className={`text-xs ${isActive ? "text-white/65" : "text-slate-500"}`}>
                        {address.total_messages} email
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-6 text-sm text-slate-500">Belum ada address yang dibuat.</div>
          )}
        </div>
      </Card>

      <Card className="min-h-0 overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Messages</div>
        </div>
        <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
          {messages.length ? (
            messages.map((message) => {
              const isActive = message.id === selectedMessageId;

              return (
                <Link
                  key={message.id}
                  href={`/dashboard?address=${selectedAddressId}&email=${message.id}`}
                  className={`block border-b border-slate-100 px-5 py-4 transition ${isActive ? "bg-amber-50" : "hover:bg-slate-50"}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-semibold">{message.subject || "(Tanpa subject)"}</div>
                      <div className="shrink-0 text-xs text-slate-500">{formatDate(message.received_at)}</div>
                    </div>
                    <div className="text-xs text-slate-600">
                      {message.from_name ? `${message.from_name} <${message.from_email}>` : message.from_email}
                    </div>
                    <p className="text-sm text-slate-500">{truncate(message.text_body || message.html_body || "", 120)}</p>
                    <div className="flex items-center justify-between">
                      <StatusBadge value={message.status} />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-6 text-sm text-slate-500">Belum ada email untuk address ini.</div>
          )}
        </div>
      </Card>

      <Card className="min-h-0 overflow-hidden p-0">
        {selectedEmail ? (
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold">{selectedEmail.subject || "(Tanpa subject)"}</h2>
                <StatusBadge value={selectedEmail.status} />
              </div>
              <div className="mt-3 grid gap-1 text-sm text-slate-600">
                <div>
                  Dari: {selectedEmail.from_name ? `${selectedEmail.from_name} <${selectedEmail.from_email}>` : selectedEmail.from_email}
                </div>
                <div>Ke: {selectedEmail.to_email}</div>
                <div>Diterima: {formatDate(selectedEmail.received_at)}</div>
              </div>
              <div className="mt-4">
                <EmailActions
                  emailId={selectedEmail.id}
                  currentStatus={selectedEmail.status}
                  currentLabel={selectedEmail.label}
                  compact
                />
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-h-0 overflow-y-auto rounded-3xl bg-slate-50 p-5">
                <div className="space-y-5">
                  <section>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Text</div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-700">
                      {selectedEmail.text_body || "(Kosong)"}
                    </pre>
                  </section>

                  <section>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">HTML Preview</div>
                    <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">
                      {selectedEmail.html_body ? (
                        <div dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(selectedEmail.html_body) }} />
                      ) : (
                        <div className="text-slate-500">(Tidak ada HTML body)</div>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              <div className="min-h-0 space-y-4 overflow-y-auto">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Raw Headers</div>
                  <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
                    {JSON.stringify(selectedEmail.raw_headers, null, 2)}
                  </pre>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Attachments</div>
                  <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
                    {JSON.stringify(selectedEmail.attachments, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center p-10 text-center text-sm text-slate-500">
            Pilih email dari panel tengah untuk melihat isi pesan.
          </div>
        )}
      </Card>
    </div>
  );
}
