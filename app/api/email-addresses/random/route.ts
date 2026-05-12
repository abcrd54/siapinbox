import { requireDashboardApiAuth } from "@/lib/auth";
import { buildEmailAddress, generateUniqueLocalPart } from "@/lib/email-generator";
import { jsonError, jsonOk } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createRandomEmailSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await requireDashboardApiAuth();
  } catch {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = createRandomEmailSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Payload tidak valid");
  }

  try {
    const localPart = await generateUniqueLocalPart(parsed.data.prefix);
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
