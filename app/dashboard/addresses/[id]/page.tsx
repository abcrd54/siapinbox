export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { EmailAddressHeader } from "@/components/EmailAddressHeader";
import { EmailMessageList } from "@/components/EmailMessageList";
import { PublicInboxSection } from "@/components/PublicInboxSection";
import { requireDashboardAuth } from "@/lib/auth";
import { getEmailAddressById, getMessagesForAddress } from "@/lib/data";
import { env } from "@/lib/env";
import { getPublicInboxLinks } from "@/lib/public-inbox";
import { truncate } from "@/lib/utils";

export default async function AddressDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ status?: string; search?: string }>;
}) {
  await requireDashboardAuth();

  const { id } = await params;
  const filters = (await searchParams) || {};
  const address = await getEmailAddressById(id);

  if (!address) {
    notFound();
  }

  const messages = await getMessagesForAddress(id, filters);
  const publicInboxLinks = await getPublicInboxLinks(id);

  return (
    <AppShell title="Address Inbox" subtitle="Lihat semua pesan masuk untuk alamat yang dipilih.">
      <EmailAddressHeader
        address={address}
        publicMessagesUrl={`${env.publicAppUrl}/api/public/email-addresses/${encodeURIComponent(address.email)}/messages`}
        publicLatestUrl={`${env.publicAppUrl}/api/public/email-addresses/${encodeURIComponent(address.email)}/latest`}
      />
      <PublicInboxSection emailAddressId={id} items={publicInboxLinks} />
      <EmailMessageList
        items={messages.map((item) => ({
          id: item.id,
          from_email: item.from_email,
          from_name: item.from_name,
          subject: item.subject,
          preview: truncate(item.text_body || item.html_body || "", 180),
          status: item.status,
          received_at: item.received_at
        }))}
      />
    </AppShell>
  );
}
