import crypto from "crypto";

import { supabaseAdmin } from "@/lib/supabase-admin";
import type { ApiKeyRecord } from "@/lib/types";

export function hashApiKey(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function createPlainApiKey() {
  return `sk_live_${crypto.randomBytes(24).toString("hex")}`;
}

export async function authenticateApiKey(bearerToken: string | null, permission: string) {
  if (!bearerToken) {
    return null;
  }

  const keyHash = hashApiKey(bearerToken);
  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("*")
    .eq("key_hash", keyHash)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const typedData = data as ApiKeyRecord;

  if (!typedData.permissions.includes(permission)) {
    return null;
  }

  await supabaseAdmin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", typedData.id);

  return typedData;
}
