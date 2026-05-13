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
    <Card className="overflow-hidden rounded-xl p-0">
      <div className="border-b border-line bg-gradient-to-r from-slate-50 to-white px-6 py-5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Address Inventory</h2>
            <p className="mt-1 text-sm text-muted">Daftar semua inbox yang aktif, lengkap dengan status dan volume pesan.</p>
          </div>
          <div className="text-sm text-slate-500">{items.length} address</div>
        </div>
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line bg-slate-50 text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Label</th>
              <th className="px-5 py-3 font-semibold">Project</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Messages</th>
              <th className="px-5 py-3 font-semibold">Created</th>
              <th className="px-5 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-line transition hover:bg-slate-50/80">
                <td className="px-5 py-4 font-semibold">{item.email}</td>
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
                  <Link href={`/dashboard/addresses/${item.id}`} className="font-semibold text-accent hover:text-blue-800">
                    View inbox
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 p-4 xl:hidden">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-line bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="break-all text-base font-semibold text-ink">{item.email}</div>
                <div className="mt-1 text-sm text-slate-600">{item.label || item.project || "Tanpa label"}</div>
              </div>
              <StatusBadge value={item.status} />
            </div>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase text-muted">Project</div>
                <div className="mt-1">{item.project || "-"}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted">Messages</div>
                <div className="mt-1">{item.total_messages} total / {item.unread_messages} unread</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted">Created</div>
                <div className="mt-1">{formatDate(item.created_at)}</div>
              </div>
            </div>
            <div className="mt-4">
              <Link href={`/dashboard/addresses/${item.id}`} className="font-semibold text-accent hover:text-blue-800">
                View inbox
              </Link>
            </div>
          </div>
        ))}
      </div>

      {!items.length ? (
        <div className="px-6 py-10 text-center text-sm text-muted">Belum ada address yang dibuat.</div>
      ) : null}
    </Card>
  );
}
