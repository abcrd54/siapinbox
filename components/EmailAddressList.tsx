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
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-4 font-medium">Email</th>
              <th className="px-5 py-4 font-medium">Label</th>
              <th className="px-5 py-4 font-medium">Project</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Messages</th>
              <th className="px-5 py-4 font-medium">Created</th>
              <th className="px-5 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-5 py-4 font-medium">{item.email}</td>
                <td className="px-5 py-4 text-slate-600">{item.label || "-"}</td>
                <td className="px-5 py-4 text-slate-600">{item.project || "-"}</td>
                <td className="px-5 py-4">
                  <StatusBadge value={item.status} />
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {item.total_messages} total / {item.unread_messages} unread
                </td>
                <td className="px-5 py-4 text-slate-600">{formatDate(item.created_at)}</td>
                <td className="px-5 py-4">
                  <Link href={`/dashboard/addresses/${item.id}`} className="font-medium text-ember">
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
