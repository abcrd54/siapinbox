export const dynamic = "force-dynamic";

import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { LogoutButton } from "@/components/LogoutButton";
import { QuickCreateAddress } from "@/components/QuickCreateAddress";
import { InboxWorkspace } from "@/components/InboxWorkspace";
import { RefreshButton } from "@/components/RefreshButton";
import { requireDashboardAuth } from "@/lib/auth";
import { getEmailAddresses, getMessageById, getMessagesForAddress, markMessageAsRead } from "@/lib/data";

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ address?: string; email?: string }>;
}) {
  await requireDashboardAuth();
  const params = (await searchParams) || {};
  const addresses = await getEmailAddresses();
  const selectedAddress = addresses.find((item) => item.id === params.address) || addresses[0] || null;
  const messages = selectedAddress ? await getMessagesForAddress(selectedAddress.id, { limit: 100 }) : [];
  const selectedMessage = messages.find((item) => item.id === params.email) || messages[0] || null;
  const selectedEmail = selectedMessage
    ? ((selectedMessage.status === "unread"
        ? await markMessageAsRead(selectedMessage.id)
        : await getMessageById(selectedMessage.id)) || await getMessageById(selectedMessage.id))
    : null;

  return (
    <AppShell title="Inbox Workspace" subtitle="Kelola address, pesan masuk, status, dan metadata dalam satu layar kerja.">
      <div className="flex flex-col gap-3 rounded-lg border border-line bg-white p-3 shadow-panel lg:flex-row lg:items-center lg:justify-between">
        <QuickCreateAddress />
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/docs/api" className="rounded-md border border-line px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
            API Docs
          </Link>
          <RefreshButton />
          <LogoutButton />
        </div>
      </div>
      <InboxWorkspace
        addresses={addresses}
        selectedAddressId={selectedAddress?.id || null}
        messages={messages}
        selectedMessageId={selectedMessage?.id || null}
        selectedEmail={selectedEmail}
      />
    </AppShell>
  );
}
