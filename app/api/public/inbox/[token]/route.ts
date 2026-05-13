import { jsonError, jsonOk } from "@/lib/http";
import { getMessagesForAddress, getPublicInboxLinkWithAddress } from "@/lib/data";
import { truncate } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const link = await getPublicInboxLinkWithAddress(token);

    if (!link?.email_addresses) {
      return jsonError("Inbox link not found", 404);
    }

    const messages = await getMessagesForAddress(link.email_address_id, { limit: link.latest_only ? 1 : 50 });

    return jsonOk({
      inbox: {
        email: link.email_addresses.email,
        label: link.email_addresses.label,
        latest_only: link.latest_only
      },
      messages: messages.map((item) => ({
        id: item.id,
        from_email: item.from_email,
        from_name: item.from_name,
        subject: item.subject,
        preview: truncate(item.text_body || item.html_body || "", 160),
        text_body: item.text_body,
        html_body: item.html_body,
        received_at: item.received_at,
        status: item.status
      }))
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to load inbox", 500);
  }
}
