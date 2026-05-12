import { createPlainApiKey, hashApiKey } from "@/lib/api-key";
import { requireDashboardApiAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createApiKeySchema } from "@/lib/validation";

export async function GET() {
  try {
    await requireDashboardApiAuth();
  } catch {
    return jsonError("Unauthorized", 401);
  }

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("id, name, project, permissions, status, last_used_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ api_keys: data || [] });
}

export async function POST(request: Request) {
  try {
    await requireDashboardApiAuth();
  } catch {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = createApiKeySchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Payload tidak valid");
  }

  const plainApiKey = createPlainApiKey();
  const keyHash = hashApiKey(plainApiKey);

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .insert({
      name: parsed.data.name,
      key_hash: keyHash,
      project: parsed.data.project,
      permissions: parsed.data.permissions
    })
    .select("id, name, project, permissions, status, last_used_at, created_at")
    .single();

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ api_key: plainApiKey, record: data }, { status: 201 });
}
