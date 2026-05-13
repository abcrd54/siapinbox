import { env } from "@/lib/env";
import { jsonError, jsonOk, getBearerToken } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { inboundEmailSchema } from "@/lib/validation";

function parseMailboxAddress(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const angleMatch = value.match(/<([^>]+)>/);
  const candidate = (angleMatch?.[1] || value).trim().toLowerCase();

  if (!candidate.includes("@")) {
    return null;
  }

  return candidate;
}

function extractSenderInfo(payload: Record<string, unknown>) {
  const rawPayload = payload.raw_payload && typeof payload.raw_payload === "object"
    ? (payload.raw_payload as Record<string, unknown>)
    : null;
  const parsedFrom = rawPayload?.parsed_from && typeof rawPayload.parsed_from === "object"
    ? (rawPayload.parsed_from as Record<string, unknown>)
    : null;
  const rawHeaders = payload.raw_headers && typeof payload.raw_headers === "object"
    ? (payload.raw_headers as Record<string, unknown>)
    : null;

  const headerFrom = parseMailboxAddress(rawHeaders?.from);
  const parsedFromAddress = parseMailboxAddress(parsedFrom?.address);
  const parsedFromName = typeof parsedFrom?.name === "string" ? parsedFrom.name.trim() : null;

  return {
    fromEmail: parsedFromAddress || headerFrom || payload.from_email,
    fromName: parsedFromName || payload.from_name
  };
}

export async function POST(request: Request) {
  const bearerToken = getBearerToken(request.headers.get("authorization"));

  if (bearerToken !== env.inboundEmailSecret) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = inboundEmailSchema.safeParse(body);

  if (!parsed.success) {
    await supabaseAdmin.from("rejected_emails").insert({
      to_email: body?.to_email || null,
      from_email: body?.from_email || null,
      subject: body?.subject || null,
      reason: "invalid_payload",
      raw_payload: body || {}
    });

    return jsonError(parsed.error.issues[0]?.message || "Payload tidak valid");
  }

  const senderInfo = extractSenderInfo(parsed.data as Record<string, unknown>);
  const normalizedFromEmail = typeof senderInfo.fromEmail === "string" ? senderInfo.fromEmail : parsed.data.from_email;
  const normalizedFromName = typeof senderInfo.fromName === "string" ? senderInfo.fromName : parsed.data.from_name;

  const { data: emailAddress, error: lookupError } = await supabaseAdmin
    .from("email_addresses")
    .select("*")
    .eq("email", parsed.data.to_email.toLowerCase())
    .maybeSingle();

  if (lookupError) {
    return jsonError(lookupError.message, 500);
  }

  if (!emailAddress) {
    await supabaseAdmin.from("rejected_emails").insert({
      to_email: parsed.data.to_email,
      from_email: parsed.data.from_email,
      subject: parsed.data.subject || null,
      reason: "email_not_registered",
      raw_payload: parsed.data
    });

    return jsonError("Email address not registered", 404);
  }

  if (emailAddress.status !== "active") {
    await supabaseAdmin.from("rejected_emails").insert({
      to_email: parsed.data.to_email,
      from_email: parsed.data.from_email,
      subject: parsed.data.subject || null,
      reason: "email_inactive",
      raw_payload: parsed.data
    });

    return jsonError("Email address inactive", 409);
  }

  const { data, error } = await supabaseAdmin
    .from("inbound_emails")
    .insert({
      email_address_id: emailAddress.id,
      message_id: parsed.data.message_id || null,
      from_email: normalizedFromEmail,
      from_name: normalizedFromName || null,
      to_email: parsed.data.to_email.toLowerCase(),
      subject: parsed.data.subject || null,
      text_body: parsed.data.text_body || null,
      html_body: parsed.data.html_body || null,
      has_attachments: Boolean(parsed.data.attachments?.length),
      attachments: parsed.data.attachments || [],
      raw_headers: parsed.data.raw_headers || null,
      raw_payload: parsed.data.raw_payload || parsed.data
    })
    .select("id")
    .single();

  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ success: true, email_id: data.id }, { status: 201 });
}
