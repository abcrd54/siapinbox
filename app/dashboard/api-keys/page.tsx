export const dynamic = "force-dynamic";

import { ApiKeyManager } from "@/components/ApiKeyManager";
import { AppShell } from "@/components/AppShell";
import { requireDashboardAuth } from "@/lib/auth";
import { listApiKeys } from "@/lib/data";

export default async function ApiKeysPage() {
  await requireDashboardAuth();
  const keys = await listApiKeys();

  return (
    <AppShell title="API Keys" subtitle="Kelola akses platform lain ke inbox publik dan generator address.">
      <ApiKeyManager items={keys} />
    </AppShell>
  );
}
