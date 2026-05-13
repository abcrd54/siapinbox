import { env } from "@/lib/env";
import { jsonError, jsonOk, getBearerToken } from "@/lib/http";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { inboundEmailSchema } from "@/lib/validation";

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

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

function toObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function extractAddressFromParsedTo(parsedTo: unknown) {
  if (!Array.isArray(parsedTo) || !parsedTo.length) {
    return null;
  }

  const first = toObject(parsedTo[0]);
  return parseMailboxAddress(first?.address);
}

function normalizeInboundPayload(body: Record<string, unknown> | null) {
  const rawPayload = toObject(body?.raw_payload);
  const rawHeaders = toObject(body?.raw_headers) || toObject(rawPayload?.headers);
  const parsedFrom = toObject(rawPayload?.parsed_from);

  const fromEmail =
    parseMailboxAddress(body?.from_email) ||
    parseMailboxAddress(parsedFrom?.address) ||
    parseMailboxAddress(rawHeaders?.from);

  const fromName =
    normalizeOptionalString(body?.from_name) ||
    normalizeOptionalString(parsedFrom?.name);

  const toEmail =
    parseMailboxAddress(body?.to_email) ||
    extractAddressFromParsedTo(rawPayload?.parsed_to) ||
    parseMailboxAddress(rawHeaders?.to);

  const subject =
    normalizeOptionalString(body?.subject) ||
    normalizeOptionalString(rawHeaders?.subject);

  const messageId =
    normalizeOptionalString(body?.message_id) ||
    normalizeOptionalString(rawHeaders?.["message-id"]);

  const textBody =
    normalizeOptionalString(body?.text_body) ||
    normalizeOptionalString(rawPayload?.text) ||
    normalizeOptionalString(rawPayload?.text_body) ||
    null;

  const htmlBody =
    normalizeOptionalString(body?.html_body) ||
    normalizeOptionalString(rawPayload?.html) ||
    normalizeOptionalString(rawPayload?.html_body) ||
    null;

  const rawEnvelope =
    normalizeOptionalString(rawPayload?.raw) ||
    normalizeOptionalString(body?.raw);

  const normalizedTextBody = textBody || (!htmlBody ? rawEnvelope : null);

  return {
    message_id: messageId,
    from_email: fromEmail,
    from_name: fromName,
    to_email: toEmail,
    subject,
    text_body: normalizedTextBody,
    html_body: htmlBody,
    raw_headers: rawHeaders || null,
    raw_payload: rawPayload || body || null,
    attachments: Array.isArray(body?.attachments) ? body?.attachments : []
  };
}

function extractSenderInfo(payload: Record<string, unknown>) {
  const rawPayload = toObject(payload.raw_payload);
  const parsedFrom = toObject(rawPayload?.parsed_from);
  const rawHeaders = toObject(payload.raw_headers);

  const headerFrom = parseMailboxAddress(rawHeaders?.from);
  const parsedFromAddress = parseMailboxAddress(parsedFrom?.address);
  const parsedFromName = normalizeOptionalString(parsedFrom?.name);

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
  const normalizedPayload = normalizeInboundPayload(toObject(body));
  const parsed = inboundEmailSchema.safeParse(normalizedPayload);

  if (!parsed.success) {
    await supabaseAdmin.from("rejected_emails").insert({
      to_email: normalizedPayload.to_email || parseMailboxAddress(toObject(body)?.to_email) || null,
      from_email: normalizedPayload.from_email || parseMailboxAddress(toObject(body)?.from_email) || null,
      subject: normalizedPayload.subject || normalizeOptionalString(toObject(body)?.subject) || null,
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
