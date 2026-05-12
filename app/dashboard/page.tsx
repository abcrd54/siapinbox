export const dynamic = "force-dynamic";

import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui";
import { StatsGrid } from "@/components/StatsGrid";
import { requireDashboardAuth } from "@/lib/auth";
import { getOverviewStats } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  await requireDashboardAuth();
  const stats = await getOverviewStats();

  return (
    <AppShell title="Inbox Operations" subtitle="Monitor alamat email aktif, pesan masuk, dan health inbox internal.">
      <StatsGrid
        items={[
          { label: "Total Addresses", value: stats.totalAddresses },
          { label: "Active Addresses", value: stats.activeAddresses },
          { label: "Total Messages", value: stats.totalMessages },
          { label: "Unread Messages", value: stats.unreadMessages }
        ]}
      />

      <Card className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Latest Received Emails</h2>
            <p className="mt-2 text-sm text-slate-600">Snapshot pesan terbaru yang masuk ke sistem.</p>
          </div>
          <Link href="/dashboard/addresses" className="text-sm font-medium text-ember">
            Manage addresses
          </Link>
        </div>

        <div className="grid gap-4">
          {stats.latestMessages.length ? (
            stats.latestMessages.map((message) => (
              <div key={message.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">{message.subject || "(Tanpa subject)"}</div>
                    <div className="text-sm text-slate-600">
                      {message.from_email} ke {message.to_email}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">{formatDate(message.received_at)}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              Belum ada email masuk.
            </div>
          )}
        </div>
      </Card>
    </AppShell>
  );
}
