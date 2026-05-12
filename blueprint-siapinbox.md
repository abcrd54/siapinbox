# Blueprint SiapInbox

Platform untuk membuat alamat email random/custom dengan domain `@siapdigital.web.id`, menerima email masuk, menyimpan ke Supabase, menampilkan inbox di dashboard, dan menyediakan API agar email dapat dibaca oleh platform lain.

---

## 1. Tujuan Project

Membuat sistem email receiver internal yang bisa digunakan untuk berbagai platform milik SiapDigital.

Contoh alamat email yang bisa dibuat:

```text
lead-8xk29@siapdigital.web.id
client-demo-001@siapdigital.web.id
otp-test-7392@siapdigital.web.id
support-project-a@siapdigital.web.id
```

Setiap alamat email akan disimpan di Supabase. Jika ada email masuk ke salah satu alamat tersebut, sistem menyimpan email masuk ke database dan menampilkannya di dashboard.

---

## 2. Gambaran Sistem

```text
User membuat email random di dashboard
↓
Email address disimpan ke Supabase
↓
Orang/platform lain mengirim email ke alamat tersebut
↓
Cloudflare Email Routing menerima email
↓
Cloudflare Email Worker memproses email masuk
↓
Worker mengirim data email ke Next.js API
↓
Next.js API menyimpan email ke Supabase
↓
Dashboard menampilkan list email address
↓
Klik email address → tampil list email masuk
↓
Platform lain bisa baca inbox melalui API
```

---

## 3. Stack Teknologi

| Komponen | Teknologi |
|---|---|
| Frontend Dashboard | Next.js + TailwindCSS |
| Backend API | Next.js API Route / Route Handler |
| Database | Supabase PostgreSQL |
| Inbound Email | Cloudflare Email Routing |
| Email Processor | Cloudflare Email Worker |
| Hosting Dashboard | Vercel |
| Auth Dashboard | NextAuth / Supabase Auth / Custom API Key |
| External API Auth | Bearer API Key |

---

## 4. Modul Utama

### 4.1 Email Address Manager

Fungsi:

- Membuat email random dengan domain `@siapdigital.web.id`
- Membuat email custom/manual
- Melihat daftar email address
- Menonaktifkan email address
- Memberi label/purpose pada email address
- Generate API key per email address atau per project

Contoh data:

```json
{
  "email": "lead-8xk29@siapdigital.web.id",
  "label": "Lead Website",
  "status": "active",
  "project": "siapdigital-main"
}
```

---

### 4.2 Inbox Viewer

Fungsi:

- Melihat daftar email address
- Klik salah satu email address
- Menampilkan email masuk untuk alamat tersebut
- Melihat detail email
- Filter by status: unread, read, archived
- Search subject/body/from
- Mark as read/unread
- Archive email
- Label email

---

### 4.3 Inbound Email Handler

Fungsi:

- Menerima payload email dari Cloudflare Worker
- Validasi secret token dari Worker
- Cek apakah `to_email` terdaftar di table `email_addresses`
- Jika terdaftar dan aktif, simpan ke table `inbound_emails`
- Jika tidak terdaftar, simpan ke rejected log atau abaikan

---

### 4.4 Public API untuk Platform Lain

Fungsi:

- Platform lain bisa membaca email masuk melalui API
- Cocok untuk testing OTP, verifikasi email, lead inbox, atau sistem internal lain
- Autentikasi menggunakan Bearer API key

Contoh:

```http
GET /api/public/emails/lead-8xk29@siapdigital.web.id/messages
Authorization: Bearer YOUR_API_KEY
```

---

## 5. Database Schema Supabase

### 5.1 Table: `email_addresses`

Menyimpan daftar email yang dibuat di dashboard.

```sql
create table email_addresses (
  id uuid primary key default gen_random_uuid(),

  email text not null unique,
  local_part text not null,
  domain text not null default 'siapdigital.web.id',

  label text,
  project text,
  purpose text,

  status text not null default 'active',
  api_key_hash text,

  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Recommended index:

```sql
create index email_addresses_email_idx
on email_addresses (email);

create index email_addresses_status_idx
on email_addresses (status);

create index email_addresses_project_idx
on email_addresses (project);
```

Status values:

```text
active
inactive
blocked
```

---

### 5.2 Table: `inbound_emails`

Menyimpan email masuk.

```sql
create table inbound_emails (
  id uuid primary key default gen_random_uuid(),

  email_address_id uuid references email_addresses(id) on delete set null,

  message_id text,
  from_email text not null,
  from_name text,
  to_email text not null,

  subject text,
  text_body text,
  html_body text,

  status text default 'unread',
  label text default 'inbox',

  has_attachments boolean default false,
  attachments jsonb default '[]'::jsonb,

  raw_headers jsonb,
  raw_payload jsonb,

  received_at timestamptz default now(),
  created_at timestamptz default now()
);
```

Recommended index:

```sql
create index inbound_emails_to_email_idx
on inbound_emails (to_email);

create index inbound_emails_received_at_idx
on inbound_emails (received_at desc);

create index inbound_emails_status_idx
on inbound_emails (status);

create index inbound_emails_email_address_id_idx
on inbound_emails (email_address_id);
```

Status values:

```text
unread
read
archived
spam
follow_up
done
```

---

### 5.3 Table: `rejected_emails`

Opsional. Menyimpan email yang masuk ke alamat yang tidak terdaftar atau inactive.

```sql
create table rejected_emails (
  id uuid primary key default gen_random_uuid(),

  to_email text,
  from_email text,
  subject text,
  reason text,

  raw_payload jsonb,
  received_at timestamptz default now()
);
```

Reason examples:

```text
email_not_registered
email_inactive
invalid_payload
```

---

### 5.4 Table: `api_keys`

Opsional jika ingin API key per project/platform.

```sql
create table api_keys (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  key_hash text not null,
  project text,
  permissions jsonb default '[]'::jsonb,

  status text default 'active',
  last_used_at timestamptz,
  created_at timestamptz default now()
);
```

Permission examples:

```json
[
  "emails:read",
  "emails:write",
  "addresses:create",
  "addresses:read"
]
```

---

## 6. API Design

### 6.1 Dashboard API

#### Create random email address

```http
POST /api/email-addresses/random
```

Body:

```json
{
  "prefix": "lead",
  "label": "Lead Website",
  "project": "siapdigital-main",
  "purpose": "Website inquiry testing"
}
```

Response:

```json
{
  "email_address": {
    "id": "uuid",
    "email": "lead-8xk29@siapdigital.web.id",
    "label": "Lead Website",
    "status": "active"
  }
}
```

---

#### Create custom email address

```http
POST /api/email-addresses
```

Body:

```json
{
  "local_part": "support-project-a",
  "label": "Support Project A",
  "project": "project-a"
}
```

Response:

```json
{
  "email_address": {
    "id": "uuid",
    "email": "support-project-a@siapdigital.web.id",
    "status": "active"
  }
}
```

---

#### List email addresses

```http
GET /api/email-addresses
```

Optional query:

```text
?status=active
?project=siapdigital-main
?search=lead
```

Response:

```json
{
  "email_addresses": [
    {
      "id": "uuid",
      "email": "lead-8xk29@siapdigital.web.id",
      "label": "Lead Website",
      "project": "siapdigital-main",
      "status": "active",
      "total_messages": 3,
      "unread_messages": 1,
      "created_at": "2026-05-13T10:00:00Z"
    }
  ]
}
```

---

#### Get messages for one email address

```http
GET /api/email-addresses/:id/messages
```

Optional query:

```text
?status=unread
?search=otp
?page=1
?limit=20
```

Response:

```json
{
  "messages": [
    {
      "id": "uuid",
      "from_email": "client@example.com",
      "from_name": "Client",
      "subject": "Verification Code",
      "preview": "Your verification code is 123456",
      "status": "unread",
      "received_at": "2026-05-13T10:00:00Z"
    }
  ]
}
```

---

#### Get email detail

```http
GET /api/emails/:id
```

Response:

```json
{
  "email": {
    "id": "uuid",
    "from_email": "client@example.com",
    "from_name": "Client",
    "to_email": "lead-8xk29@siapdigital.web.id",
    "subject": "Verification Code",
    "text_body": "Your verification code is 123456",
    "html_body": "<p>Your verification code is <b>123456</b></p>",
    "status": "read",
    "received_at": "2026-05-13T10:00:00Z"
  }
}
```

---

#### Update email status/label

```http
PATCH /api/emails/:id
```

Body:

```json
{
  "status": "read",
  "label": "otp"
}
```

---

### 6.2 Inbound API from Cloudflare Worker

Endpoint ini hanya untuk Cloudflare Worker.

```http
POST /api/inbound-email
Authorization: Bearer INBOUND_EMAIL_SECRET
```

Body:

```json
{
  "message_id": "<message-id>",
  "from_email": "sender@example.com",
  "from_name": "Sender Name",
  "to_email": "lead-8xk29@siapdigital.web.id",
  "subject": "Test Email",
  "text_body": "Hello from email",
  "html_body": "<p>Hello from email</p>",
  "raw_headers": {},
  "raw_payload": {}
}
```

Process:

```text
1. Validate Authorization header
2. Validate to_email
3. Find matching email_addresses.email
4. If active, insert into inbound_emails
5. If not found/inactive, insert into rejected_emails or ignore
6. Return success
```

Response:

```json
{
  "success": true,
  "email_id": "uuid"
}
```

---

### 6.3 Public API for Other Platforms

#### Create random email from external platform

```http
POST /api/public/email-addresses/random
Authorization: Bearer PLATFORM_API_KEY
```

Body:

```json
{
  "prefix": "otp-test",
  "project": "automation-tool",
  "label": "OTP Test"
}
```

Response:

```json
{
  "email": "otp-test-7fk29@siapdigital.web.id"
}
```

---

#### Read messages by email address

```http
GET /api/public/email-addresses/:email/messages
Authorization: Bearer PLATFORM_API_KEY
```

Example:

```http
GET /api/public/email-addresses/otp-test-7fk29@siapdigital.web.id/messages
Authorization: Bearer sk_live_xxx
```

Response:

```json
{
  "messages": [
    {
      "id": "uuid",
      "from_email": "noreply@example.com",
      "subject": "Your OTP Code",
      "text_body": "Your code is 123456",
      "received_at": "2026-05-13T10:00:00Z"
    }
  ]
}
```

---

#### Read latest message

```http
GET /api/public/email-addresses/:email/latest
Authorization: Bearer PLATFORM_API_KEY
```

Useful for OTP/testing.

Response:

```json
{
  "message": {
    "id": "uuid",
    "subject": "Your OTP Code",
    "text_body": "Your code is 123456",
    "received_at": "2026-05-13T10:00:00Z"
  }
}
```

---

#### Extract OTP helper endpoint

Optional, useful for automation tools.

```http
GET /api/public/email-addresses/:email/latest-otp
Authorization: Bearer PLATFORM_API_KEY
```

Response:

```json
{
  "otp": "123456",
  "source_message_id": "uuid",
  "received_at": "2026-05-13T10:00:00Z"
}
```

Regex suggestion:

```text
\b\d{4,8}\b
```

---

## 7. Dashboard Pages

### 7.1 `/dashboard`

Overview:

- Total email addresses
- Active email addresses
- Total inbox messages
- Unread messages
- Latest received emails

---

### 7.2 `/dashboard/addresses`

List email addresses.

Columns:

| Column | Description |
|---|---|
| Email | Full email address |
| Label | Purpose/name |
| Project | Related project |
| Status | active/inactive |
| Messages | total/unread |
| Created | created_at |
| Action | view/copy/deactivate |

Actions:

- Create random email
- Create custom email
- Copy email address
- View inbox
- Deactivate

---

### 7.3 `/dashboard/addresses/[id]`

Inbox for one email address.

Sections:

- Email address info
- API endpoint example
- List incoming messages
- Filter unread/read/archive
- Search message

---

### 7.4 `/dashboard/emails/[id]`

Detail email.

Sections:

- Subject
- From
- To
- Received at
- Text body
- HTML preview
- Raw headers, collapsible
- Attachments, optional

Actions:

- Mark as read/unread
- Archive
- Add label
- Copy sender email
- Copy body

---

### 7.5 `/dashboard/api-keys`

API key management for other platforms.

Features:

- Create API key
- Revoke API key
- See last used
- Assign project
- Assign permissions

---

## 8. Cloudflare Setup Blueprint

### 8.1 Domain Requirement

Domain `siapdigital.web.id` should use Cloudflare nameservers.

If domain currently points to Vercel, website can still work through Cloudflare DNS.

Vercel DNS records example:

```text
A      @       76.76.21.21
CNAME  www     cname.vercel-dns.com
```

If Vercel gives a specific CNAME verification value, add it in Cloudflare DNS.

---

### 8.2 Enable Email Routing

Cloudflare Dashboard:

```text
Domain → Email → Email Routing → Enable
```

Cloudflare will add MX/TXT records automatically.

---

### 8.3 Catch-all Routing

Because the platform will generate many random emails, use catch-all email routing.

Example:

```text
*@siapdigital.web.id → Cloudflare Worker
```

This lets the system receive emails for any generated local part.

Important:

```text
The Worker must validate whether the target email exists in Supabase.
If not registered, reject or ignore the email.
```

---

### 8.4 Cloudflare Email Worker

Worker responsibility:

```text
1. Receive inbound email
2. Extract from, to, subject, message-id, raw headers
3. Parse body if possible
4. POST data to Next.js API
5. Reject email if API returns invalid or inactive address
```

Basic Worker example:

```ts
export default {
  async email(message, env, ctx) {
    const rawEmail = await new Response(message.raw).text();

    const payload = {
      message_id: message.headers.get("message-id"),
      from_email: message.from,
      to_email: message.to,
      subject: message.headers.get("subject"),
      raw_headers: Object.fromEntries(message.headers),
      raw_payload: {
        raw: rawEmail
      }
    };

    const response = await fetch(env.INBOUND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.INBOUND_EMAIL_SECRET}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      message.setReject("Email address not accepted by SiapInbox");
    }
  }
}
```

Notes:

- For MVP, store raw email first.
- Full MIME parsing can be handled later in Next.js or Worker.
- Do not render raw HTML email directly without sanitization.

---

## 9. Environment Variables

### 9.1 Vercel / Next.js

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
INBOUND_EMAIL_SECRET=
APP_API_SECRET=
PUBLIC_APP_URL=https://tools.siapdigital.web.id
```

### 9.2 Cloudflare Worker

```env
INBOUND_API_URL=https://tools.siapdigital.web.id/api/inbound-email
INBOUND_EMAIL_SECRET=same_value_as_nextjs
```

---

## 10. Random Email Generation Logic

### Format

```text
{prefix}-{random}@siapdigital.web.id
```

Examples:

```text
lead-k82md@siapdigital.web.id
otp-test-4n9xa@siapdigital.web.id
client-demo-q29fs@siapdigital.web.id
```

### Rules

- Lowercase only
- Allowed characters: `a-z`, `0-9`, `-`, `_`
- Minimum random length: 5 characters
- Check uniqueness in Supabase before insert
- Max local part length: 64 characters

### Example function

```ts
function generateLocalPart(prefix = "inbox") {
  const cleanPrefix = prefix
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const random = Math.random().toString(36).slice(2, 7);

  return `${cleanPrefix || "inbox"}-${random}`;
}
```

---

## 11. Security Rules

### 11.1 Inbound Email Endpoint

- Must require `Authorization: Bearer INBOUND_EMAIL_SECRET`
- Must not be callable publicly without secret
- Must validate payload size
- Must validate `to_email`
- Must not trust raw email content

---

### 11.2 Public API

- Require API key
- Store only hashed API keys
- Rate limit by API key
- Restrict API key permissions
- Return only email data allowed for that project/API key

---

### 11.3 Dashboard

- Require login
- Service role key only on server
- Never expose Supabase service role key in browser
- Sanitize HTML email before display
- Use iframe sandbox for HTML preview if needed

---

## 12. MVP Scope

### Version 1: Core MVP

Features:

```text
✅ Create random email address
✅ Create custom email address
✅ Store address in Supabase
✅ Receive inbound email via Cloudflare catch-all
✅ Validate target email against Supabase
✅ Save inbound email to Supabase
✅ Dashboard list email addresses
✅ Dashboard inbox per address
✅ Email detail page
✅ Public API to read messages
✅ Latest message endpoint
```

Not included yet:

```text
❌ Reply email from dashboard
❌ Attachment storage
❌ Full MIME parser
❌ AI summary
❌ Team role management
```

---

### Version 2: Automation Features

```text
✅ OTP extraction endpoint
✅ Webhook notification when new email arrives
✅ Telegram notification
✅ Auto label by keyword
✅ Search full text
✅ API key per project
✅ Rate limiting
```

---

### Version 3: Advanced Inbox

```text
✅ Attachment handling with Supabase Storage or R2
✅ HTML email safe preview
✅ AI summary
✅ AI intent classification
✅ Reply draft generator
✅ SMTP/reply integration
```

---

## 13. Project Structure

```text
siapinbox/
├─ app/
│  ├─ api/
│  │  ├─ inbound-email/route.ts
│  │  ├─ email-addresses/route.ts
│  │  ├─ email-addresses/random/route.ts
│  │  ├─ email-addresses/[id]/messages/route.ts
│  │  ├─ emails/[id]/route.ts
│  │  └─ public/
│  │     ├─ email-addresses/random/route.ts
│  │     ├─ email-addresses/[email]/messages/route.ts
│  │     ├─ email-addresses/[email]/latest/route.ts
│  │     └─ email-addresses/[email]/latest-otp/route.ts
│  ├─ dashboard/
│  │  ├─ page.tsx
│  │  ├─ addresses/page.tsx
│  │  ├─ addresses/[id]/page.tsx
│  │  ├─ emails/[id]/page.tsx
│  │  └─ api-keys/page.tsx
│  └─ login/page.tsx
├─ components/
│  ├─ EmailAddressList.tsx
│  ├─ EmailMessageList.tsx
│  ├─ EmailDetail.tsx
│  ├─ CreateEmailDialog.tsx
│  └─ StatusBadge.tsx
├─ lib/
│  ├─ supabase-admin.ts
│  ├─ auth.ts
│  ├─ api-key.ts
│  ├─ email-generator.ts
│  └─ sanitize-email-html.ts
├─ workers/
│  └─ cloudflare-email-worker.ts
└─ README.md
```

---

## 14. Development Steps

Recommended order:

```text
1. Create Supabase project
2. Create tables: email_addresses, inbound_emails, rejected_emails, api_keys
3. Build Next.js API: create random email address
4. Build Next.js API: list email addresses
5. Build Next.js API: inbound-email insert endpoint
6. Test inbound endpoint manually with Postman/curl
7. Build dashboard list addresses
8. Build dashboard inbox per address
9. Build public API messages/latest
10. Add API key auth
11. Setup Cloudflare Email Routing
12. Create Cloudflare Email Worker
13. Connect catch-all to Worker
14. Send test email to random address
15. Verify email appears in dashboard
```

---

## 15. Manual Testing Plan

### Test 1: Create random email

Input:

```json
{
  "prefix": "otp-test",
  "project": "testing"
}
```

Expected:

```text
otp-test-xxxxx@siapdigital.web.id created in Supabase
```

---

### Test 2: Send email to registered address

Action:

```text
Send Gmail email to otp-test-xxxxx@siapdigital.web.id
```

Expected:

```text
Email appears in dashboard under that address
```

---

### Test 3: Send email to unregistered address

Action:

```text
Send email to random-not-created@siapdigital.web.id
```

Expected:

```text
Email rejected, ignored, or saved in rejected_emails
```

---

### Test 4: Public API latest message

Request:

```http
GET /api/public/email-addresses/otp-test-xxxxx@siapdigital.web.id/latest
Authorization: Bearer PLATFORM_API_KEY
```

Expected:

```json
{
  "message": {
    "subject": "...",
    "text_body": "..."
  }
}
```

---

## 16. Notes for Cloudflare Setup

Use catch-all only if random emails are core feature.

Recommended route:

```text
Catch-all: *@siapdigital.web.id
Action: Send to Worker
```

The Worker should not accept every email blindly. It should forward to the API, and the API should validate if the target address exists and is active.

For safety, keep `rejected_emails` table during development. In production, rejected emails can be ignored to reduce storage.

---

## 17. Future Considerations

- Add attachment support using Cloudflare R2 or Supabase Storage
- Add outbound reply using SMTP provider
- Add AI email summary
- Add lead scoring
- Add webhook callback per email address/project
- Add temporary email expiration date
- Add custom domain support for other clients
- Add tenant/project isolation for SaaS use

---

## 18. Final Recommendation

For the first version, build only:

```text
1. Random email generator
2. Supabase storage
3. Cloudflare catch-all inbound email
4. Worker → Next.js API
5. Dashboard email address list
6. Inbox per email address
7. Public API latest message
```

This is enough to make SiapInbox useful for internal tools and other platforms that need temporary/custom domain inbox access.
