import { jsonError } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { ApiKeyRecord } from "@/lib/types";

export class PublicApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export function resolveApiKeyProject(apiKey: ApiKeyRecord, requestedProject?: string) {
  if (apiKey.project && requestedProject && requestedProject !== apiKey.project) {
    throw new PublicApiError("Forbidden", 403);
  }

  return apiKey.project || requestedProject;
}

export function parseLimit(value: string | null, fallback = 20, max = 100) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

export async function getReadableAddressForApiKey(email: string, apiKey: ApiKeyRecord) {
  const { data: address, error } = await supabaseAdmin
    .from("email_addresses")
    .select("id, project")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return { address: null, response: jsonError(error.message, 500) };
  }

  if (!address) {
    return { address: null, response: jsonError("Email address not found", 404) };
  }

  if (apiKey.project && address.project !== apiKey.project) {
    return { address: null, response: jsonError("Forbidden", 403) };
  }

  return { address, response: null };
}
