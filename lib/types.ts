export type EmailAddressStatus = "active" | "inactive" | "blocked";

export type EmailMessageStatus =
  | "unread"
  | "read"
  | "archived"
  | "spam"
  | "follow_up"
  | "done";

export type ApiKeyStatus = "active" | "revoked";
export type PublicInboxLinkStatus = "active" | "revoked";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface EmailAddressRecord {
  id: string;
  email: string;
  local_part: string;
  domain: string;
  label: string | null;
  project: string | null;
  purpose: string | null;
  status: EmailAddressStatus;
  api_key_hash: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface InboundEmailRecord {
  id: string;
  email_address_id: string | null;
  message_id: string | null;
  from_email: string;
  from_name: string | null;
  to_email: string;
  subject: string | null;
  text_body: string | null;
  html_body: string | null;
  status: EmailMessageStatus;
  label: string;
  has_attachments: boolean;
  attachments: Json[];
  raw_headers: Json | null;
  raw_payload: Json | null;
  received_at: string;
  created_at: string;
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  key_hash: string;
  project: string | null;
  permissions: string[];
  status: ApiKeyStatus;
  last_used_at: string | null;
  created_at: string;
}

export interface PublicInboxLinkRecord {
  id: string;
  email_address_id: string;
  token: string;
  label: string | null;
  latest_only: boolean;
  status: PublicInboxLinkStatus;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}
