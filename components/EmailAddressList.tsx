import Link from "next/link";

import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface EmailAddressListItem {
  id: string;
  email: string;
  label: string | null;
  project: string | null;
  status: string;
  total_messages: number;
  unread_messages: number;
  created_at: string;
}

export function EmailAddressList({ items }: { items: EmailAddressListItem[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line bg-slate-50 text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Label</th>
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Messages</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-line transition hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{item.email}</td>
                <td className="px-4 py-3 text-slate-600">{item.label || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{item.project || "-"}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={item.status} />
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {item.total_messages} total / {item.unread_messages} unread
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(item.created_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/addresses/${item.id}`} className="font-semibold text-accent hover:text-blue-800">
                    View inbox
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
