import Link from "next/link";

import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui";
import { formatDate, truncate } from "@/lib/utils";

interface EmailMessageListItem {
  id: string;
  from_email: string;
  from_name: string | null;
  subject: string | null;
  preview: string;
  status: string;
  received_at: string;
}

export function EmailMessageList({ items }: { items: EmailMessageListItem[] }) {
  return (
    <Card className="overflow-hidden rounded-xl p-0">
      <div className="divide-y divide-line">
        {items.length ? (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/emails/${item.id}`}
              className="block px-4 py-3 transition hover:bg-slate-50"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{item.subject || "(Tanpa subject)"}</span>
                    <StatusBadge value={item.status} />
                  </div>
                  <div className="text-sm text-slate-600">
                    Dari {item.from_name ? `${item.from_name} <${item.from_email}>` : item.from_email}
                  </div>
                  <p className="text-sm text-muted">{truncate(item.preview, 180)}</p>
                </div>
                <div className="text-sm text-muted">{formatDate(item.received_at)}</div>
              </div>
            </Link>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-sm text-muted">Belum ada email masuk.</div>
        )}
      </div>
    </Card>
  );
}
