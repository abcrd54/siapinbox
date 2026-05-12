import { requireDashboardApiAuth } from "@/lib/auth";
import { buildEmailAddress, ensureValidLocalPart, sanitizeLocalPartInput } from "@/lib/email-generator";
import { jsonError, jsonOk } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createCustomEmailSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    await requireDashboardApiAuth();
  } catch {
    return jsonError("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const project = searchParams.get("project");
  const search = searchParams.get("search");

  let query = supabaseAdmin
    .from("email_addresses")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (project) {
    query = query.eq("project", project);
  }

  if (search) {
    query = query.or(`email.ilike.%${search}%,label.ilike.%${search}%,project.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ email_addresses: data });
}

export async function POST(request: Request) {
  try {
    await requireDashboardApiAuth();
  } catch {
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

    const { data, error } = await supabaseAdmin
      .from("email_addresses")
      .insert({
        email,
        local_part: localPart,
        domain: process.env.APP_DOMAIN || "siapdigital.web.id",
        label: parsed.data.label,
        project: parsed.data.project,
        purpose: parsed.data.purpose,
        created_by: "dashboard"
      })
      .select("*")
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    return jsonOk({ email_address: data }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Gagal membuat email");
  }
}
