import { authenticateApiKey } from "@/lib/api-key";
import { extractLinksFromHtml } from "@/lib/email-links";
import { getBearerToken, jsonError, jsonOk } from "@/lib/http";
import { getReadableAddressForApiKey } from "@/lib/public-api";
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

  const { address, response } = await getReadableAddressForApiKey(decodedEmail);
  if (response) {
    return response;
  }

  const { data, error } = await supabaseAdmin
    .from("inbound_emails")
    .select("id, subject, html_body, received_at")
    .eq("email_address_id", address.id)
    .order("received_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return jsonError(error.message, 500);
  }

  if (!data) {
    return jsonError("No messages found", 404);
  }

  const links = extractLinksFromHtml(data.html_body);

  return jsonOk({
    message_id: data.id,
    subject: data.subject,
    received_at: data.received_at,
    links
  });
}
