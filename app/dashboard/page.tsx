export const dynamic = "force-dynamic";

import Link from "next/link";

import { LogoutButton } from "@/components/LogoutButton";
import { QuickCreateAddress } from "@/components/QuickCreateAddress";
import { InboxWorkspace } from "@/components/InboxWorkspace";
import { RefreshButton } from "@/components/RefreshButton";
import { requireDashboardAuth } from "@/lib/auth";
import { getEmailAddresses, getMessageById, getMessagesForAddress } from "@/lib/data";
import { env } from "@/lib/env";

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
  const selectedEmail = selectedMessage ? await getMessageById(selectedMessage.id) : null;

  return (
    <main className="flex min-h-screen flex-col p-4">
      <div className="mb-4 flex flex-col gap-4 rounded-[32px] bg-ink px-5 py-5 text-white shadow-panel lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">
            SiapInbox
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Inbox Workspace</h1>
            <p className="text-sm text-white/65">Domain aktif: @{env.appDomain}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <QuickCreateAddress />
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50">Layout fokus inbox, tanpa banyak menu.</span>
            <Link
              href="/docs/api"
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
            >
              API Docs
            </Link>
            <RefreshButton />
            <LogoutButton />
          </div>
        </div>
      </div>

      <InboxWorkspace
        addresses={addresses}
        selectedAddressId={selectedAddress?.id || null}
        messages={messages}
        selectedMessageId={selectedMessage?.id || null}
        selectedEmail={selectedEmail}
      />
    </main>
  );
}
