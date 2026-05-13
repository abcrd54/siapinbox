create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.email_addresses (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  local_part text not null,
  domain text not null default 'siapdigital.web.id',
  label text,
  project text,
  purpose text,
  status text not null default 'active' check (status in ('active', 'inactive', 'blocked')),
  api_key_hash text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists email_addresses_email_idx
on public.email_addresses (email);

create index if not exists email_addresses_status_idx
on public.email_addresses (status);

create index if not exists email_addresses_project_idx
on public.email_addresses (project);

create trigger set_email_addresses_updated_at
before update on public.email_addresses
for each row
execute function public.set_updated_at();

create table if not exists public.inbound_emails (
  id uuid primary key default gen_random_uuid(),
  email_address_id uuid references public.email_addresses(id) on delete set null,
  message_id text,
  from_email text not null,
  from_name text,
  to_email text not null,
  subject text,
  text_body text,
  html_body text,
  status text not null default 'unread' check (status in ('unread', 'read', 'archived', 'spam', 'follow_up', 'done')),
  label text not null default 'inbox',
  has_attachments boolean not null default false,
  attachments jsonb not null default '[]'::jsonb,
  raw_headers jsonb,
  raw_payload jsonb,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists inbound_emails_to_email_idx
on public.inbound_emails (to_email);

create index if not exists inbound_emails_received_at_idx
on public.inbound_emails (received_at desc);

create index if not exists inbound_emails_status_idx
on public.inbound_emails (status);

create index if not exists inbound_emails_email_address_id_idx
on public.inbound_emails (email_address_id);

create table if not exists public.rejected_emails (
  id uuid primary key default gen_random_uuid(),
  to_email text,
  from_email text,
  subject text,
  reason text not null check (reason in ('email_not_registered', 'email_inactive', 'invalid_payload', 'invalid_secret')),
  raw_payload jsonb,
  received_at timestamptz not null default now()
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  key_hash text not null unique,
  project text,
  permissions jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'revoked')),
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists api_keys_project_idx
on public.api_keys (project);

create index if not exists api_keys_status_idx
on public.api_keys (status);

create table if not exists public.public_inbox_links (
  id uuid primary key default gen_random_uuid(),
  email_address_id uuid not null references public.email_addresses(id) on delete cascade,
  token text not null unique,
  label text,
  latest_only boolean not null default false,
  status text not null default 'active' check (status in ('active', 'revoked')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists public_inbox_links_email_address_id_idx
on public.public_inbox_links (email_address_id);

create index if not exists public_inbox_links_token_idx
on public.public_inbox_links (token);

create trigger set_public_inbox_links_updated_at
before update on public.public_inbox_links
for each row
execute function public.set_updated_at();
