import crypto from "crypto";

import { env } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { PublicInboxLinkRecord } from "@/lib/types";

export function createPublicInboxToken() {
  return crypto.randomBytes(24).toString("base64url");
}

export function buildPublicInboxUrl(token: string) {
  return `${env.publicAppUrl}/inbox/${token}`;
}

export async function createPublicInboxLink(input: {
  emailAddressId: string;
  label?: string | null;
  latestOnly?: boolean;
  expiresAt?: string | null;
}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = createPublicInboxToken();
    const { data, error } = await supabaseAdmin
      .from("public_inbox_links")
      .insert({
        email_address_id: input.emailAddressId,
        token,
        label: input.label || null,
        latest_only: Boolean(input.latestOnly),
        expires_at: input.expiresAt || null
      })
      .select("*")
      .single();

    if (!error) {
      return data as PublicInboxLinkRecord;
    }

    if (!String(error.message).toLowerCase().includes("duplicate")) {
      throw error;
    }
  }

  throw new Error("Failed to generate public inbox token");
}

export async function getPublicInboxLinks(emailAddressId: string) {
  const { data, error } = await supabaseAdmin
    .from("public_inbox_links")
    .select("*")
    .eq("email_address_id", emailAddressId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data as PublicInboxLinkRecord[]) || []).map((item) => ({
    ...item,
    url: buildPublicInboxUrl(item.token)
  }));
}

export async function getPublicInboxLinkByToken(token: string) {
  const { data, error } = await supabaseAdmin
    .from("public_inbox_links")
    .select("*")
    .eq("token", token)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw error;
  }

  const link = (data as PublicInboxLinkRecord | null) || null;

  if (!link) {
    return null;
  }

  if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
    return null;
  }

  return link;
}
