import { authenticateApiKey } from "@/lib/api-key";
import { getBearerToken, jsonError, jsonOk } from "@/lib/http";
import { extractOtp } from "@/lib/otp";
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
    .select("id, text_body, html_body, received_at")
    .eq("email_address_id", address.id)
    .order("received_at", { ascending: false })
    .limit(5);

  if (error) {
    return jsonError(error.message, 500);
  }

  for (const item of (data || []) as Array<Record<string, any>>) {
    const otp = extractOtp(item.text_body || item.html_body);
    if (otp) {
      return jsonOk({
        otp,
        source_message_id: item.id,
        received_at: item.received_at
      });
    }
  }

  return jsonError("OTP not found", 404);
}
