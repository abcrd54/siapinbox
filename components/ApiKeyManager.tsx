"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { StatusBadge } from "@/components/StatusBadge";
import { Button, Card, Input } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface ApiKeyItem {
  id: string;
  name: string;
  project: string | null;
  permissions: string[];
  status: string;
  created_at: string;
  last_used_at: string | null;
}

export function ApiKeyManager({ items }: { items: ApiKeyItem[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [permissions, setPermissions] = useState("emails:read,addresses:create");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function createKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch("/api/api-keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        project,
        permissions: permissions
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Gagal membuat API key");
      setPending(false);
      return;
    }

    setNewKey(result.api_key);
    setName("");
    setProject("");
    setPending(false);
    router.refresh();
  }

  async function revokeKey(id: string) {
    await fetch(`/api/api-keys/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "revoked" })
    });

    router.refresh();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Create API Key</h2>
          <p className="mt-1 text-sm text-muted">Key hanya ditampilkan sekali setelah dibuat. Simpan di platform yang membutuhkannya.</p>
        </div>

        <form className="space-y-4" onSubmit={createKey}>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Project</label>
            <Input value={project} onChange={(event) => setProject(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Permissions</label>
            <Input
              value={permissions}
              onChange={(event) => setPermissions(event.target.value)}
              placeholder="emails:read,addresses:create"
            />
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {newKey ? <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 break-all text-sm text-emerald-700">API key baru: {newKey}</p> : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Membuat..." : "Create key"}
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
          <thead className="border-b border-line bg-slate-50 text-left text-xs uppercase text-muted">
            <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Permissions</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Last used</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.project || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{item.permissions.join(", ")}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={item.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(item.last_used_at)}</td>
                  <td className="px-4 py-3">
                    {item.status === "active" ? (
                      <button type="button" className="font-semibold text-danger hover:text-rose-800" onClick={() => revokeKey(item.id)}>
                        Revoke
                      </button>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
