import { requireDashboardApiAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { parseLimit } from "@/lib/public-api";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { truncate } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireDashboardApiAuth();
  } catch {
    return jsonError("Unauthorized", 401);
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const limit = parseLimit(searchParams.get("limit"));

  let query = supabaseAdmin
    .from("inbound_emails")
    .select("*")
    .eq("email_address_id", id)
    .order("received_at", { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`subject.ilike.%${search}%,text_body.ilike.%${search}%,from_email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({
    messages: ((data || []) as Array<Record<string, any>>).map((item) => ({
      id: item.id,
      from_email: item.from_email,
      from_name: item.from_name,
      subject: item.subject,
      preview: truncate(item.text_body || item.html_body || "", 120),
      status: item.status,
      received_at: item.received_at
    }))
  });
}
