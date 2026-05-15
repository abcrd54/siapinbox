import { env } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase-admin";

const LOCAL_PART_REGEX = /^[a-z0-9][a-z0-9-_]{0,63}$/;

export function sanitizeLocalPartInput(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function ensureValidLocalPart(value: string) {
  if (!value || value.length > 64 || !LOCAL_PART_REGEX.test(value)) {
    throw new Error("Invalid local part format");
  }
}

export function buildEmailAddress(localPart: string) {
  return `${localPart}@${env.appDomain}`;
}

export function generateLocalPart(prefix = "inbox") {
  const cleanPrefix = sanitizeLocalPartInput(prefix) || "inbox";
  const randomDigits = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  const maxPrefixLength = 64 - randomDigits.length;
  const localPart = `${cleanPrefix.slice(0, maxPrefixLength)}${randomDigits}`;

  ensureValidLocalPart(localPart);

  return localPart;
}

export async function generateUniqueLocalPart(prefix = "inbox") {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const localPart = generateLocalPart(prefix);
    const email = buildEmailAddress(localPart);
    const { data, error } = await supabaseAdmin
      .from("email_addresses")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return localPart;
    }
  }

  throw new Error("Failed to generate unique email address");
}
