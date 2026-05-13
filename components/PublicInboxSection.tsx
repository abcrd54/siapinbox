import { PublicInboxLinkManager } from "@/components/PublicInboxLinkManager";
import type { PublicInboxLinkRecord } from "@/lib/types";

export function PublicInboxSection({
  emailAddressId,
  items
}: {
  emailAddressId: string;
  items: Array<PublicInboxLinkRecord & { url: string }>;
}) {
  return <PublicInboxLinkManager emailAddressId={emailAddressId} items={items} />;
}
