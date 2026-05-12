# SiapInbox

Platform inbox internal untuk membuat alamat email random/custom di domain `@siapdigital.web.id`, menerima email masuk lewat Cloudflare Email Routing, menyimpannya ke Supabase, lalu menampilkannya di dashboard Next.js dan public API.

## Stack

- Next.js App Router
- Tailwind CSS
- Supabase PostgreSQL
- Cloudflare Email Routing + Email Worker

## Struktur

```text
app/
  api/
  dashboard/
  login/
components/
lib/
supabase/
workers/
```

## Environment

Salin `.env.example` ke `.env.local` lalu isi:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
INBOUND_EMAIL_SECRET=
APP_API_SECRET=
DASHBOARD_PASSWORD=
PUBLIC_APP_URL=http://localhost:3000
APP_DOMAIN=siapdigital.web.id
```

## Setup Supabase

1. Buat project Supabase.
2. Jalankan SQL di [supabase/schema.sql](/E:/Project/email/supabase/schema.sql).
3. Ambil `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`.

Table yang dibuat:

- `email_addresses`
- `inbound_emails`
- `rejected_emails`
- `api_keys`

## Setup Project

```bash
npm install
npm run dev
```

Lalu buka `http://localhost:3000/login`.

## Dashboard Login

Dashboard memakai auth cookie sederhana untuk internal use.

- password login memakai `DASHBOARD_PASSWORD`
- jika `DASHBOARD_PASSWORD` kosong, fallback ke `APP_API_SECRET`

## API yang Tersedia

### Dashboard/Internal

- `POST /api/email-addresses/random`
- `POST /api/email-addresses`
- `GET /api/email-addresses`
- `GET /api/email-addresses/:id/messages`
- `GET /api/emails/:id`
- `PATCH /api/emails/:id`
- `GET /api/api-keys`
- `POST /api/api-keys`
- `PATCH /api/api-keys/:id`

### Inbound dari Worker

- `POST /api/inbound-email`

Wajib header:

```http
Authorization: Bearer INBOUND_EMAIL_SECRET
```

### Public API

- `POST /api/public/email-addresses/random`
- `GET /api/public/email-addresses/:email/messages`
- `GET /api/public/email-addresses/:email/latest`
- `GET /api/public/email-addresses/:email/latest-otp`

Public API memakai Bearer API key yang disimpan dalam bentuk hash di tabel `api_keys`.

Permission yang saat ini dipakai:

- `addresses:create`
- `emails:read`

## Cloudflare Setup

1. Pastikan domain memakai nameserver Cloudflare.
2. Aktifkan Email Routing.
3. Buat catch-all route:

```text
*@siapdigital.web.id -> Worker
```

4. Deploy worker dari [workers/cloudflare-email-worker.ts](/E:/Project/email/workers/cloudflare-email-worker.ts).
5. Isi env worker:

```env
INBOUND_API_URL=https://your-app-domain/api/inbound-email
INBOUND_EMAIL_SECRET=same-value-as-nextjs
```

## Catatan Implementasi

- Validasi email target selalu dilakukan di backend sebelum insert inbox.
- Email yang tidak terdaftar atau inactive masuk ke `rejected_emails`.
- HTML email disanitasi secara minimal sebelum preview.
- API key plaintext hanya muncul sekali saat dibuat dari dashboard.

## MVP yang Sudah Tercakup

- create random email
- create custom email
- inbox dashboard per address
- email detail
- inbound API dari Cloudflare Worker
- public API messages/latest/latest-otp
- API key management
