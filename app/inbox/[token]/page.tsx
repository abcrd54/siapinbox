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
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Card className="overflow-hidden bg-ink p-0 text-white">
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
              <Card key={message.id} className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{message.subject || "(Tanpa subject)"}</h2>
                  <div className="text-sm text-slate-600">
                    Dari {message.from_name ? `${message.from_name} <${message.from_email}>` : message.from_email}
                  </div>
                  <div className="text-sm text-slate-500">{formatDate(message.received_at)}</div>
                </div>

                <section>
                  <div className="mb-2 text-xs font-semibold uppercase text-muted">Text</div>
                  <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm text-slate-700">
                    {message.text_body || "(Kosong)"}
                  </pre>
                </section>

                <section>
                  <div className="mb-2 text-xs font-semibold uppercase text-muted">HTML Preview</div>
                  <div className="rounded-md border border-line bg-white p-4 text-sm text-slate-700">
                    {message.html_body ? (
                      <div dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(message.html_body) }} />
                    ) : (
                      <div className="text-slate-500">(Tidak ada HTML body)</div>
                    )}
                  </div>
                </section>
              </Card>
            ))
          ) : (
            <Card className="text-center text-sm text-muted">Belum ada email di inbox ini.</Card>
          )}
        </div>
      </div>
    </main>
  );
}
