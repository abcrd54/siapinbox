import { supabaseAdmin } from "@/lib/supabase-admin";
import type { ApiKeyRecord, EmailAddressRecord, InboundEmailRecord } from "@/lib/types";

interface LatestMessageSummary {
  id: string;
  subject: string | null;
  from_email: string;
  to_email: string;
  received_at: string;
  status: string;
}

export async function getOverviewStats() {
  const [
    { count: totalAddresses, error: addressesError },
    { count: activeAddresses, error: activeError },
    { count: totalMessages, error: messagesError },
    { count: unreadMessages, error: unreadError },
    { data: latestMessages, error: latestError }
  ] = await Promise.all([
    supabaseAdmin.from("email_addresses").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("email_addresses").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabaseAdmin.from("inbound_emails").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("inbound_emails").select("*", { count: "exact", head: true }).eq("status", "unread"),
    supabaseAdmin
      .from("inbound_emails")
      .select("id, subject, from_email, to_email, received_at, status")
      .order("received_at", { ascending: false })
      .limit(8)
  ]);

  if (addressesError || activeError || messagesError || unreadError || latestError) {
    throw addressesError || activeError || messagesError || unreadError || latestError;
  }

  return {
    totalAddresses: totalAddresses || 0,
    activeAddresses: activeAddresses || 0,
    totalMessages: totalMessages || 0,
    unreadMessages: unreadMessages || 0,
    latestMessages: ((latestMessages || []) as LatestMessageSummary[])
  };
}

export async function getEmailAddresses(filters?: {
  status?: string | null;
  project?: string | null;
  search?: string | null;
}) {
  let query = supabaseAdmin
    .from("email_addresses")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.project) {
    query = query.eq("project", filters.project);
  }

  if (filters?.search) {
    query = query.or(`email.ilike.%${filters.search}%,label.ilike.%${filters.search}%,project.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  const typedData = (data || []) as EmailAddressRecord[];

  if (error) {
    throw error;
  }

  const ids = typedData.map((item) => item.id);
  const { data: messages, error: messagesError } = ids.length
    ? await supabaseAdmin
        .from("inbound_emails")
        .select("id, email_address_id, status")
        .in("email_address_id", ids)
    : { data: [], error: null };

  if (messagesError) {
    throw messagesError;
  }

  const counts = new Map<string, { total: number; unread: number }>();

  for (const item of (messages || []) as Array<{ email_address_id: string | null; status: string }>) {
    if (!item.email_address_id) {
      continue;
    }

    const current = counts.get(item.email_address_id) || { total: 0, unread: 0 };
    current.total += 1;
    if (item.status === "unread") {
      current.unread += 1;
    }
    counts.set(item.email_address_id, current);
  }

  return typedData.map((item) => ({
    ...item,
    total_messages: counts.get(item.id)?.total || 0,
    unread_messages: counts.get(item.id)?.unread || 0
  }));
}

export async function getEmailAddressById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("email_addresses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as EmailAddressRecord | null) || null;
}

export async function getMessagesForAddress(
  emailAddressId: string,
  filters?: { status?: string | null; search?: string | null; limit?: number }
) {
  let query = supabaseAdmin
    .from("inbound_emails")
    .select("*")
    .eq("email_address_id", emailAddressId)
    .order("received_at", { ascending: false })
    .limit(filters?.limit || 50);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.search) {
    query = query.or(`subject.ilike.%${filters.search}%,text_body.ilike.%${filters.search}%,from_email.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data as InboundEmailRecord[]) || [];
}

export async function getMessageById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("inbound_emails")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as InboundEmailRecord | null) || null;
}

export async function listApiKeys() {
  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("*")
    .order("created_at", { ascending: false })
    ;

  if (error) {
    throw error;
  }

  return (data as ApiKeyRecord[]) || [];
}
