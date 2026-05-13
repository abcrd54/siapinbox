import { requireDashboardApiAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { createPublicInboxLink, getPublicInboxLinks } from "@/lib/public-inbox";
import { z } from "zod";

const createPublicInboxLinkSchema = z.object({
  email_address_id: z.string().uuid(),
  label: z.string().trim().max(120).optional().or(z.literal("")),
  latest_only: z.boolean().optional(),
  expires_at: z.string().datetime().optional().nullable().or(z.literal(""))
});

export async function GET(request: Request) {
  try {
    await requireDashboardApiAuth();
  } catch {
    return jsonError("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const emailAddressId = searchParams.get("email_address_id");

  if (!emailAddressId) {
    return jsonError("email_address_id is required");
  }

  try {
    const links = await getPublicInboxLinks(emailAddressId);
    return jsonOk({ public_inbox_links: links });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to fetch public inbox links", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireDashboardApiAuth();
  } catch {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = createPublicInboxLinkSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Payload tidak valid");
  }

  try {
    const link = await createPublicInboxLink({
      emailAddressId: parsed.data.email_address_id,
      label: parsed.data.label || null,
      latestOnly: parsed.data.latest_only,
      expiresAt: parsed.data.expires_at || null
    });

    return jsonOk({ public_inbox_link: link }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Failed to create public inbox link", 500);
  }
}
