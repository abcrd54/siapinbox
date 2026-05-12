import Link from "next/link";

import { Card } from "@/components/ui";
import { env } from "@/lib/env";

const sections = [
  {
    title: "Authentication",
    items: [
      "`/api/inbound-email` memakai `Authorization: Bearer INBOUND_EMAIL_SECRET`.",
      "Public API memakai Bearer API key dari tabel `api_keys`.",
      "Dashboard API memakai session login dashboard."
    ]
  },
  {
    title: "Public Permissions",
    items: [
      "`addresses:create` untuk membuat random atau custom email dari platform lain.",
      "`emails:read` untuk membaca messages, latest message, dan latest OTP."
    ]
  }
];

const publicBaseUrl = `${env.publicAppUrl}/api/public`;

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="overflow-hidden bg-ink p-0 text-white">
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                SiapInbox API
              </div>
              <div>
                <h1 className="text-3xl font-semibold">API Docs</h1>
                <p className="mt-2 max-w-3xl text-sm text-white/70">
                  Dokumentasi lengkap untuk dashboard API, public API, dan inbound endpoint dari Cloudflare Worker.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10">
                Back to Inbox
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold">Base URLs</h2>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div>Dashboard/App: <span className="font-medium text-ink">{env.publicAppUrl}</span></div>
                <div>Inbound API: <span className="font-medium text-ink">{env.publicAppUrl}/api/inbound-email</span></div>
                <div>Public API: <span className="font-medium text-ink">{publicBaseUrl}</span></div>
              </div>
            </div>

            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{section.title}</h3>
                <div className="space-y-2 text-sm text-slate-700">
                  {section.items.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </section>
            ))}

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Cloudflare Worker Env</h3>
              <pre className="overflow-x-auto rounded-2xl bg-slate-50 p-4 text-xs text-slate-700">
{`INBOUND_API_URL=${env.publicAppUrl}/api/inbound-email
INBOUND_EMAIL_SECRET=<same value as Next.js>
VERCEL_AUTOMATION_BYPASS_SECRET=<optional if deployment protection is enabled>`}
              </pre>
              <p className="text-sm text-slate-600">
                Jika project Vercel memakai Deployment Protection, Worker harus mengirim header
                {" "}
                <code>x-vercel-protection-bypass</code>
                {" "}
                dengan secret automation bypass dari Vercel.
              </p>
            </section>
          </Card>

          <div className="space-y-6">
            <Card className="space-y-4">
              <h2 className="text-xl font-semibold">Inbound Endpoint</h2>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <div className="font-medium">POST /api/inbound-email</div>
                <div className="mt-2">Dipanggil oleh Cloudflare Email Worker untuk menyimpan email masuk.</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <div className="mb-2 font-medium">Request Format</div>
                <pre className="overflow-x-auto rounded-2xl bg-white p-4 text-xs text-slate-700">
{`{
  "message_id": "<message-id>",
  "from_email": "sender@example.com",
  "from_name": "Sender Name",
  "to_email": "lead-8xk29@${env.appDomain}",
  "subject": "Test Email",
  "text_body": "Hello from email",
  "html_body": "<p>Hello from email</p>",
  "raw_headers": {},
  "raw_payload": {},
  "attachments": []
}`}
                </pre>
              </div>
              <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
{`curl -X POST "${env.publicAppUrl}/api/inbound-email" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer INBOUND_EMAIL_SECRET" \\
  -d '{
    "message_id": "<message-id>",
    "from_email": "sender@example.com",
    "from_name": "Sender Name",
    "to_email": "lead-8xk29@${env.appDomain}",
    "subject": "Test Email",
    "text_body": "Hello from email",
    "html_body": "<p>Hello from email</p>",
    "raw_headers": {},
    "raw_payload": {}
  }'`}
              </pre>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <div className="mb-2 font-medium">Success Response</div>
                <pre className="overflow-x-auto rounded-2xl bg-white p-4 text-xs text-slate-700">
{`{
  "success": true,
  "email_id": "uuid"
}`}
                </pre>
              </div>
            </Card>

            <Card className="space-y-4">
              <h2 className="text-xl font-semibold">Public API</h2>
              <div className="space-y-4 text-sm text-slate-700">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-medium">POST /api/public/email-addresses</div>
                  <div className="mt-2">Membuat custom email address tetap dengan `local_part` tertentu.</div>
                </div>
                <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
{`curl -X POST "${publicBaseUrl}/email-addresses" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "local_part": "support-project-a",
    "project": "project-a",
    "label": "Support Project A",
                    "purpose": "Fixed address for support testing"
  }'`}
                </pre>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 font-medium">Response Format</div>
                  <pre className="overflow-x-auto rounded-2xl bg-white p-4 text-xs text-slate-700">
{`{
  "email_address": {
    "id": "uuid",
    "email": "support-project-a@${env.appDomain}",
    "local_part": "support-project-a",
    "label": "Support Project A",
    "project": "project-a",
    "status": "active",
    "created_at": "2026-05-13T10:00:00Z"
  }
}`}
                  </pre>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-medium">POST /api/public/email-addresses/random</div>
                  <div className="mt-2">Membuat random email address untuk automation atau OTP flow.</div>
                </div>
                <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
{`curl -X POST "${publicBaseUrl}/email-addresses/random" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prefix": "otp-test",
    "project": "automation-tool",
    "label": "OTP Test"
  }'`}
                </pre>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 font-medium">Response Format</div>
                  <pre className="overflow-x-auto rounded-2xl bg-white p-4 text-xs text-slate-700">
{`{
  "email": "otp-test-7fk29@${env.appDomain}"
}`}
                  </pre>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-medium">GET /api/public/email-addresses/:email/messages</div>
                  <div className="mt-2">Mengambil daftar message berdasarkan email address.</div>
                </div>
                <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
{`curl "${publicBaseUrl}/email-addresses/otp-test-7fk29@${env.appDomain}/messages" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                </pre>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 font-medium">Response Format</div>
                  <pre className="overflow-x-auto rounded-2xl bg-white p-4 text-xs text-slate-700">
{`{
  "messages": [
    {
      "id": "uuid",
      "from_email": "noreply@example.com",
      "from_name": "No Reply",
      "subject": "Verify your email",
      "text_body": "Click the button below",
      "html_body": "<a href=\\"https://example.com\\">Verify</a>",
      "received_at": "2026-05-13T10:00:00Z",
      "status": "unread"
    }
  ]
}`}
                  </pre>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-medium">GET /api/public/email-addresses/:email/latest</div>
                  <div className="mt-2">Mengambil email terbaru. Cocok untuk polling OTP.</div>
                </div>
                <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
{`curl "${publicBaseUrl}/email-addresses/otp-test-7fk29@${env.appDomain}/latest" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                </pre>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 font-medium">Response Format</div>
                  <pre className="overflow-x-auto rounded-2xl bg-white p-4 text-xs text-slate-700">
{`{
  "message": {
    "id": "uuid",
    "subject": "Your OTP Code",
    "text_body": "Your code is 123456",
    "html_body": "<p>Your code is <b>123456</b></p>",
    "received_at": "2026-05-13T10:00:00Z",
    "from_email": "noreply@example.com",
    "from_name": null,
    "status": "unread"
  }
}`}
                  </pre>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-medium">GET /api/public/email-addresses/:email/latest-otp</div>
                  <div className="mt-2">Mencari OTP 4-8 digit dari beberapa email terbaru.</div>
                </div>
                <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
{`curl "${publicBaseUrl}/email-addresses/otp-test-7fk29@${env.appDomain}/latest-otp" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                </pre>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 font-medium">Response Format</div>
                  <pre className="overflow-x-auto rounded-2xl bg-white p-4 text-xs text-slate-700">
{`{
  "otp": "123456",
  "source_message_id": "uuid",
  "received_at": "2026-05-13T10:00:00Z"
}`}
                  </pre>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-medium">GET /api/public/email-addresses/:email/latest-links</div>
                  <div className="mt-2">Mengambil semua link dari `html_body` email terakhir.</div>
                </div>
                <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
{`curl "${publicBaseUrl}/email-addresses/otp-test-7fk29@${env.appDomain}/latest-links" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                </pre>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 font-medium">Response Format</div>
                  <pre className="overflow-x-auto rounded-2xl bg-white p-4 text-xs text-slate-700">
{`{
  "message_id": "uuid",
  "subject": "Verify your email",
  "received_at": "2026-05-13T10:00:00Z",
  "links": [
    {
      "url": "https://example.com/verify?token=abc",
      "text": "Verify Email"
    }
  ]
}`}
                  </pre>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-medium">GET /api/public/email-addresses/:email/latest-primary-link</div>
                  <div className="mt-2">Mengambil link utama dari email terakhir, cocok untuk verify/confirm/reset link.</div>
                </div>
                <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
{`curl "${publicBaseUrl}/email-addresses/otp-test-7fk29@${env.appDomain}/latest-primary-link" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                </pre>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-2 font-medium">Response Format</div>
                  <pre className="overflow-x-auto rounded-2xl bg-white p-4 text-xs text-slate-700">
{`{
  "message_id": "uuid",
  "subject": "Verify your email",
  "received_at": "2026-05-13T10:00:00Z",
  "link": {
    "url": "https://example.com/verify?token=abc",
    "text": "Verify Email"
  }
}`}
                  </pre>
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <h2 className="text-xl font-semibold">Dashboard API</h2>
              <div className="space-y-3 text-sm text-slate-700">
                <p>`POST /api/email-addresses/random` untuk create random address dari dashboard.</p>
                <p>`POST /api/email-addresses` untuk create custom address.</p>
                <p>`GET /api/email-addresses` untuk list seluruh address.</p>
                <p>`GET /api/email-addresses/:id/messages` untuk list messages per address.</p>
                <p>`GET /api/emails/:id` dan `PATCH /api/emails/:id` untuk detail dan update status/label.</p>
                <p>`GET /api/api-keys`, `POST /api/api-keys`, `PATCH /api/api-keys/:id` untuk manajemen API key.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
