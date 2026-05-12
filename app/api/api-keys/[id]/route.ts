import { requireDashboardApiAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireDashboardApiAuth();
  } catch {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (!["active", "revoked"].includes(status)) {
    return jsonError("Status tidak valid");
  }

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .update({ status })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ api_key: data });
}
