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
    <div className="grid gap-5 2xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card className="rounded-xl border border-line bg-gradient-to-br from-ink to-slate-800 p-6 text-white">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Create API Key</h2>
          <p className="mt-1 text-sm text-white/70">Key hanya ditampilkan sekali setelah dibuat. Simpan di platform yang membutuhkannya.</p>
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

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {newKey ? <p className="break-all rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">API key baru: {newKey}</p> : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Membuat..." : "Create key"}
          </Button>
        </form>

        <div className="mt-6 grid gap-3 text-sm text-white/80">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Permissions</div>
            <div className="mt-2">Pisahkan permission dengan koma, misalnya `emails:read,addresses:create`.</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Security</div>
            <div className="mt-2">Gunakan key berbeda per platform agar revoke tidak mengganggu integrasi lain.</div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-xl p-0">
        <div className="border-b border-line bg-gradient-to-r from-slate-50 to-white px-6 py-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Issued Keys</h2>
              <p className="mt-1 text-sm text-muted">Pantau permission, status, dan aktivitas key dari satu tempat.</p>
            </div>
            <div className="text-sm text-slate-500">{items.length} key</div>
          </div>
        </div>

        <div className="hidden overflow-x-auto xl:block">
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
                <tr key={item.id} className="border-b border-line transition hover:bg-slate-50/80">
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

        <div className="grid gap-4 p-4 xl:hidden">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-line bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-base font-semibold text-ink">{item.name}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.project || "Tanpa project"}</div>
                </div>
                <StatusBadge value={item.status} />
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <div>
                  <div className="text-xs uppercase text-muted">Permissions</div>
                  <div className="mt-1 break-words">{item.permissions.join(", ") || "-"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-muted">Last used</div>
                  <div className="mt-1">{formatDate(item.last_used_at)}</div>
                </div>
              </div>
              <div className="mt-4">
                {item.status === "active" ? (
                  <button type="button" className="font-semibold text-danger hover:text-rose-800" onClick={() => revokeKey(item.id)}>
                    Revoke
                  </button>
                ) : (
                  <span className="text-slate-400">Revoked</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {!items.length ? <div className="px-6 py-10 text-center text-sm text-muted">Belum ada API key.</div> : null}
      </Card>
    </div>
  );
}
