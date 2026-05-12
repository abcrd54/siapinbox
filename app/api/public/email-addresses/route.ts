import { authenticateApiKey } from "@/lib/api-key";
import { buildEmailAddress, ensureValidLocalPart, sanitizeLocalPartInput } from "@/lib/email-generator";
import { getBearerToken, jsonError, jsonOk } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createCustomEmailSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const token = getBearerToken(request.headers.get("authorization"));
  const apiKey = await authenticateApiKey(token, "addresses:create");

  if (!apiKey) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = createCustomEmailSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Payload tidak valid");
  }

  try {
    const localPart = sanitizeLocalPartInput(parsed.data.local_part);
    ensureValidLocalPart(localPart);
    const email = buildEmailAddress(localPart);

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("email_addresses")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      return jsonError(existingError.message, 500);
    }

    if (existing) {
      return jsonError("Email address already exists", 409);
    }

    const { data, error } = await supabaseAdmin
      .from("email_addresses")
      .insert({
        email,
        local_part: localPart,
        domain: process.env.APP_DOMAIN || "siapdigital.web.id",
        label: parsed.data.label,
        project: parsed.data.project || apiKey.project,
        purpose: parsed.data.purpose,
        created_by: `api_key:${apiKey.id}`
      })
      .select("id, email, local_part, label, project, status, created_at")
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    return jsonOk({ email_address: data }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal membuat email");
  }
}
