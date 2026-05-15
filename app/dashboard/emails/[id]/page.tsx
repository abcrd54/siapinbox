export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { EmailDetail } from "@/components/EmailDetail";
import { requireDashboardAuth } from "@/lib/auth";
import { getMessageById, markMessageAsRead } from "@/lib/data";

export default async function EmailDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireDashboardAuth();

  const { id } = await params;
  const email = (await markMessageAsRead(id)) || (await getMessageById(id));

  if (!email) {
    notFound();
  }

  return (
    <AppShell title="Email Detail" subtitle="Buka isi email, raw headers, dan update status tanpa keluar dari dashboard." wide>
      <EmailDetail email={email} />
    </AppShell>
  );
}
