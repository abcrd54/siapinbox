import { notFound } from "next/navigation";

import { Card } from "@/components/ui";
import { getMessagesForAddress, getPublicInboxLinkWithAddress } from "@/lib/data";
import { sanitizeEmailHtml } from "@/lib/sanitize-email-html";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PublicInboxPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const link = await getPublicInboxLinkWithAddress(token);

  if (!link?.email_addresses) {
    notFound();
  }

  const messages = await getMessagesForAddress(link.email_address_id, {
    limit: link.latest_only ? 1 : 50
  });

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 xl:px-10">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <Card className="overflow-hidden rounded-xl bg-ink p-0 text-white">
          <div className="p-6">
            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              Shared Inbox
            </div>
            <h1 className="mt-4 text-3xl font-semibold">{link.email_addresses.email}</h1>
            <p className="mt-2 text-sm text-white/70">
              {link.latest_only ? "Menampilkan email terbaru saja." : "Menampilkan inbox read-only tanpa akses dashboard."}
            </p>
          </div>
        </Card>

        <div className="grid gap-4">
          {messages.length ? (
            messages.map((message) => (
              <Card key={message.id} className="overflow-hidden rounded-xl p-0">
                <div className="border-b border-line bg-gradient-to-r from-slate-50 to-white px-5 py-5">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">{message.subject || "(Tanpa subject)"}</h2>
                    <div className="text-sm text-slate-600">
                      Dari {message.from_name ? `${message.from_name} <${message.from_email}>` : message.from_email}
                    </div>
                    <div className="text-sm text-slate-500">{formatDate(message.received_at)}</div>
                  </div>
                </div>

                <div className="grid gap-4 p-4 xl:grid-cols-[360px_minmax(0,1fr)]">
                  <section className="rounded-xl border border-line bg-slate-50 p-4">
                    <div className="mb-3 text-xs font-semibold uppercase text-muted">Text</div>
                    <pre className="max-h-[320px] overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {message.text_body || "(Kosong)"}
                    </pre>
                  </section>

                  <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-slate-50">
                    <div className="border-b border-line px-4 py-3 text-xs font-semibold uppercase text-muted">HTML Preview</div>
                    <div className="min-h-[420px] overflow-y-auto p-4">
                      {message.html_body ? (
                        <div className="rounded-lg border border-line bg-white p-5 text-sm text-slate-700 shadow-sm" dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(message.html_body) }} />
                      ) : (
                        <div className="rounded-lg border border-dashed border-line bg-white p-6 text-slate-500">(Tidak ada HTML body)</div>
                      )}
                    </div>
                  </section>
                </div>
              </Card>
            ))
          ) : (
            <Card className="rounded-xl text-center text-sm text-muted">Belum ada email di inbox ini.</Card>
          )}
        </div>
      </div>
    </main>
  );
}
