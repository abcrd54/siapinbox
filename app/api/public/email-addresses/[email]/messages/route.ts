import { authenticateApiKey } from "@/lib/api-key";
import { getBearerToken, jsonError, jsonOk } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const token = getBearerToken(request.headers.get("authorization"));
  const apiKey = await authenticateApiKey(token, "emails:read");

  if (!apiKey) {
    return jsonError("Unauthorized", 401);
  }

  const { email } = await params;
  const decodedEmail = decodeURIComponent(email).toLowerCase();
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || "20");

  const { data: address, error: addressError } = await supabaseAdmin
    .from("email_addresses")
    .select("id, project")
    .eq("email", decodedEmail)
    .maybeSingle();

  if (addressError) {
    return jsonError(addressError.message, 500);
  }

  if (!address) {
    return jsonError("Email address not found", 404);
  }

  if (apiKey.project && address.project && apiKey.project !== address.project) {
    return jsonError("Forbidden", 403);
  }

  const { data, error } = await supabaseAdmin
    .from("inbound_emails")
    .select("id, from_email, from_name, subject, text_body, html_body, received_at, status")
    .eq("email_address_id", address.id)
    .order("received_at", { ascending: false })
    .limit(limit);

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ messages: data || [] });
}
