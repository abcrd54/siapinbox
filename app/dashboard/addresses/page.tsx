export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import { CreateEmailForms } from "@/components/CreateEmailForms";
import { EmailAddressList } from "@/components/EmailAddressList";
import { requireDashboardAuth } from "@/lib/auth";
import { getEmailAddresses } from "@/lib/data";

export default async function AddressesPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string; project?: string; search?: string }>;
}) {
  await requireDashboardAuth();
  const filters = (await searchParams) || {};
  const addresses = await getEmailAddresses(filters);

  return (
    <AppShell title="Email Addresses" subtitle="Buat alamat random/custom lalu pantau inbox masing-masing address." wide>
      <CreateEmailForms />
      <EmailAddressList items={addresses} />
    </AppShell>
  );
}
