import { requireDashboardApiAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { emailMessageUpdateSchema } from "@/lib/validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireDashboardApiAuth();
  } catch {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await params;
  const { data, error } = await supabaseAdmin.from("inbound_emails").select("*").eq("id", id).maybeSingle();

  if (error) {
    return jsonError(error.message, 500);
  }

  if (!data) {
    return jsonError("Email tidak ditemukan", 404);
  }

  return jsonOk({ email: data });
}

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
  const parsed = emailMessageUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Payload tidak valid");
  }

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("inbound_emails")
    .update(parsed.data)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ email: data });
}
