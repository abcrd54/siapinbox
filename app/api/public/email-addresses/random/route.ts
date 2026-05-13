import { authenticateApiKey } from "@/lib/api-key";
import { buildEmailAddress, generateUniqueLocalPart } from "@/lib/email-generator";
import { getBearerToken, jsonError, jsonOk } from "@/lib/http";
import { resolveApiKeyProject } from "@/lib/public-api";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createRandomEmailSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const token = getBearerToken(request.headers.get("authorization"));
  const apiKey = await authenticateApiKey(token, "addresses:create");

  if (!apiKey) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = createRandomEmailSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Payload tidak valid");
  }

  try {
    const project = resolveApiKeyProject(apiKey, parsed.data.project);
    const localPart = await generateUniqueLocalPart(parsed.data.prefix);
    const email = buildEmailAddress(localPart);

    const { error } = await supabaseAdmin.from("email_addresses").insert({
      email,
      local_part: localPart,
      domain: process.env.APP_DOMAIN || "siapdigital.web.id",
      label: parsed.data.label,
      project,
      purpose: parsed.data.purpose,
      created_by: `api_key:${apiKey.id}`
    });

    if (error) {
      return jsonError(error.message, 500);
    }

    return jsonOk({ email }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal membuat email");
  }
}
